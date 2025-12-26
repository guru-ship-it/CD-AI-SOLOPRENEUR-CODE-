import os
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select, extract
from database import SessionLocalApp
from models import SalesRegister
from services.finance_service import ReportingService
from services.interakt import send_support_alert_email

async def run_monthly_report():
    """
    Fetches sales records for the previous month and emails the GSTR-1 report.
    """
    print("--- [REPORTING] Starting Monthly GSTR-1 Export ---")
    
    # Calculate previous month
    today = datetime.now()
    first_day_this_month = today.replace(day=1)
    last_day_prev_month = first_day_this_month - timedelta(days=1)
    prev_month = last_day_prev_month.month
    prev_year = last_day_prev_month.year

    async with SessionLocalApp() as db:
        # Fetch records for the previous month
        query = select(SalesRegister).filter(
            extract('month', SalesRegister.created_at) == prev_month,
            extract('year', SalesRegister.created_at) == prev_year
        )
        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            print(f"[REPORTING] No sales records found for {prev_month}/{prev_year}.")
            return

        # Convert to list of dicts for pandas
        data = []
        for r in records:
            data.append({
                "Invoice No": f"CD-{r.created_at.strftime('%Y%m%d')}-{r.payment_id[-6:].upper()}",
                "Invoice Date": r.created_at.strftime('%Y-%m-%d'),
                "Payment ID": r.payment_id,
                "Customer": r.customer_name,
                "Mobile": r.mobile_number,
                "POS": f"{r.place_of_supply} ({r.state_code})",
                "Taxable Value": r.base_amount,
                "Tax Type": r.tax_type,
                "CGST": r.cgst or "0.00",
                "SGST": r.sgst or "0.00",
                "IGST": r.igst or "0.00",
                "Total Amount": r.total_amount
            })

        # Export to Excel
        excel_path = ReportingService.export_gstr1(data)
        print(f"[REPORTING] Report generated: {excel_path}")

        # Delivery
        recipients = [
            "accounts@compliancedesk.ai",
            "guru@compliancedesk.ai",
            "info@sandeepcharkha.com"
        ]
        
        subject = f"Monthly GSTR-1 Sales Register - {last_day_prev_month.strftime('%B %Y')}"
        body = (
            f"Hello Team,\n\n"
            f"Please find attached the Sales Register for {last_day_prev_month.strftime('%B %Y')}.\n\n"
            f"Total Invoices: {len(records)}\n"
            f"Total Sales: INR {sum(float(r.total_amount) for r in records)}\n\n"
            f"Report Path: {excel_path}\n\n"
            f"Best Regards,\nComplianceDesk AI Billing System"
        )

        for recipient in recipients:
            # Here we reuse the simulation function, in prod we'd add the attachment
            print(f"[REPORTING] Mailing to {recipient}...")
            send_support_alert_email(subject, body)

    print("--- [REPORTING] Monthly Export COMPLETED ---")

if __name__ == "__main__":
    asyncio.run(run_monthly_report())
