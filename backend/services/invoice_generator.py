import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from services.finance_engine import FinanceEngine

class InvoiceGenerator:
    @staticmethod
    def generate_gst_invoice(user_name, transaction_id, customer_state, amount=99.00, type="RETAIL"):
        """
        Generates a legally valid Tax Invoice or Advance Receipt PDF.
        """
        from services.finance_engine import FinanceEngine
        tax_info = FinanceEngine.calculate_tax_breakdown(amount, customer_state)
        
        prefix = "INV" if type == "RETAIL" else "ADV"
        invoice_number = f"{prefix}-{datetime.now().strftime('%Y%m%d')}-{transaction_id[:4].upper()}"
        filename = f"/tmp/{invoice_number}.pdf"
        if os.name == 'nt':
            filename = f"{invoice_number}.pdf"
            
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        # -- Header --
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "ComplianceDesk.ai")
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 70, "502B Sadhguru Capital Park, Madhapur")
        c.drawString(50, height - 85, "Hyderabad, Telangana - 500081")
        c.drawString(50, height - 100, "GSTIN: [INSERT_GSTIN_HERE]") 
        
        # -- Invoice Details --
        label = "RETAIL TAX INVOICE" if type == "RETAIL" else "ADVANCE RECEIPT"
        c.setFont("Helvetica-Bold", 12)
        c.drawString(350, height - 50, label)
        c.setFont("Helvetica", 10)
        c.drawString(350, height - 70, f"Date: {datetime.now().strftime('%d-%b-%Y')}")
        c.drawString(350, height - 85, f"Invoice #: {invoice_number}")
        
        # -- Financial Table --
        y = height - 200
        c.setFont("Helvetica-Bold", 10)
        desc = "Monthly Compliance Locker" if type == "RETAIL" else "B2B Wallet Top-up (Advance)"
        c.drawString(50, y, f"Description: {desc}")
        c.setFont("Helvetica", 10)
        c.drawString(350, y, "SAC: 998313")
        c.drawString(450, y, f"INR {tax_info['taxable_value']}")
        
        y -= 40
        if tax_info['type'] == 'INTRA':
            c.drawString(350, y, f"CGST (9%): {tax_info['cgst']}")
            y -= 15
            c.drawString(350, y, f"SGST (9%): {tax_info['sgst']}")
        else:
            c.drawString(350, y, f"IGST (18%): {tax_info['igst']}")
            
        y -= 30
        c.setFont("Helvetica-Bold", 12)
        c.drawString(350, y, f"TOTAL: INR {amount}")
        
        # Footer
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(50, 50, "Terms: This is a computer generated document and does not require a physical signature.")
        if type == "ADVANCE_RECEIPT":
            c.drawString(50, 40, "Note: GST Input Credit can be claimed against this Advance Receipt as per Rule 50 of CGST Rules.")
        
        c.showPage()
        c.save()
        return filename
