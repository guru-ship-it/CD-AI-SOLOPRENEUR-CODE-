import re

class FinanceEngine:
    HQ_STATE = "Telangana"
    HQ_STATE_CODE = "36"
    TAX_RATE = 0.18
    
    # Pricing Tiers (INR)
    PRICES = {
        "B2C_RETAIL": 99.00,
        "B2B_KYC": 50.00,
        "B2B_KYB": 20.00
    }

    @staticmethod
    def get_price(tier):
        return FinanceEngine.PRICES.get(tier, 99.00)

    @staticmethod
    async def check_wallet_balance(db, tenant_id, required_amount):
        from models import Tenant
        from sqlalchemy import select
        
        # In a real app, this would be a proper join/query
        result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            return False, "Tenant not found"
        
        if tenant.wallet_balance < required_amount:
            return False, f"Insufficient balance. Required: ₹{required_amount}, Current: ₹{tenant.wallet_balance}"
        
        return True, tenant

    @staticmethod
    async def deduct_from_wallet(db, tenant_id, amount):
        success, res = await FinanceEngine.check_wallet_balance(db, tenant_id, amount)
        if not success:
            raise Exception(res)
        
        tenant = res
        tenant.wallet_balance -= amount
        await db.commit()
        return tenant.wallet_balance

    @staticmethod
    def detect_state_from_ocr(ocr_text):
        """
        Scans OCR text for Indian States or Pincodes to determine Place of Supply.
        """
        import re
        text = (ocr_text or "").lower()
        states = {
            "telangana": "Telangana", "hyderabad": "Telangana", "rangareddy": "Telangana",
            "andhra": "Andhra Pradesh", "karnataka": "Karnataka", "bangalore": "Karnataka",
            "maharashtra": "Maharashtra", "mumbai": "Maharashtra", "tamil": "Tamil Nadu",
            "chennai": "Tamil Nadu", "delhi": "Delhi"
        }
        for key, value in states.items():
            if key in text: return value

        pincode_match = re.search(r'\b\d{6}\b', text)
        if pincode_match:
            pincode = int(pincode_match.group())
            if 500000 <= pincode <= 509999: return "Telangana"
            if 510000 <= pincode <= 539999: return "Andhra Pradesh"
            if 560000 <= pincode <= 599999: return "Karnataka"
            if 400000 <= pincode <= 449999: return "Maharashtra"
            if 110000 <= pincode <= 119999: return "Delhi"
            if 600000 <= pincode <= 669999: return "Tamil Nadu"

        return "Telangana"

    @staticmethod
    def calculate_tax_breakdown(amount_paid, customer_state):
        """
        Differentiates Intra-State (CGST+SGST) vs Inter-State (IGST).
        Back-calculates from inclusive price.
        """
        taxable_value = round(amount_paid / (1 + FinanceEngine.TAX_RATE), 2)
        total_tax = round(amount_paid - taxable_value, 2)
        
        # Compatibility fields
        mapping = {"Telangana": "36", "Andhra Pradesh": "37", "Karnataka": "29", "Maharashtra": "27", "Tamil Nadu": "33", "Delhi": "07"}
        state_name = customer_state or FinanceEngine.HQ_STATE
        state_code = mapping.get(state_name, "36")

        if not customer_state or customer_state.title() == FinanceEngine.HQ_STATE:
            return {
                "type": "INTRA",
                "tax_type": "Intra-State",
                "taxable_value": taxable_value,
                "base_price": taxable_value,
                "gst_total": total_tax,
                "cgst": round(total_tax / 2, 2),
                "sgst": round(total_tax / 2, 2),
                "igst": 0.00,
                "total": amount_paid,
                "state_name": state_name,
                "state_code": state_code
            }
        else:
            return {
                "type": "INTER",
                "tax_type": "Inter-State",
                "taxable_value": taxable_value,
                "base_price": taxable_value,
                "gst_total": total_tax,
                "cgst": 0.00,
                "sgst": 0.00,
                "igst": total_tax,
                "total": amount_paid,
                "state_name": state_name,
                "state_code": state_code
            }

class ReportingService:
    @staticmethod
    def export_gstr1(records: list):
        """
        Exports sales register records to Excel in GSTR-1 format.
        """
        import pandas as pd
        df = pd.DataFrame(records)
        output_file = f"/tmp/GSTR1_Report_{datetime.now().strftime('%Y%m')}.xlsx"
        if os.name == 'nt':
            output_file = f"GSTR1_Report_{datetime.now().strftime('%Y%m')}.xlsx"
        
        df.to_excel(output_file, index=False)
        return output_file
