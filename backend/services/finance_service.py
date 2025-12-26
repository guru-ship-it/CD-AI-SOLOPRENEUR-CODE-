import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
import pandas as pd
import json

class GSTCalculator:
    BASE_PRICE = 83.90
    GST_RATE = 0.18 # 18%
    TOTAL_PRICE = 99.00
    HQ_STATE_CODE = "36" # Telangana
    HQ_STATE_NAME = "Telangana"

    STATE_CODE_MAPPING = {
        "Telangana": "36",
        "Andhra Pradesh": "37",
        "Karnataka": "29",
        "Maharashtra": "27",
        "Tamil Nadu": "33",
        "Delhi": "07"
    }

    @staticmethod
    def detect_state_from_ocr(ocr_text):
        """
        Scans the ID Card text for Indian States or Pincodes.
        Returns 'Telangana', 'Karnataka', etc. or None.
        """
        text = (ocr_text or "").lower()
        
        # 1. Direct State Name Mapping
        states = {
            "telangana": "Telangana",
            "hyderabad": "Telangana",
            "rangareddy": "Telangana",
            "andhra": "Andhra Pradesh",
            "karnataka": "Karnataka",
            "bangalore": "Karnataka",
            "bengaluru": "Karnataka",
            "maharashtra": "Maharashtra",
            "mumbai": "Maharashtra",
            "tamil": "Tamil Nadu",
            "chennai": "Tamil Nadu",
            "delhi": "Delhi"
        }
        
        # Check for keywords
        for key, value in states.items():
            if key in text:
                return value

        # 2. Pincode Logic (Regex)
        pincode_match = re.search(r'\b\d{6}\b', text)
        
        if pincode_match:
            pincode = int(pincode_match.group())
            
            # Pincode Ranges
            if 500000 <= pincode <= 509999: return "Telangana"
            if 510000 <= pincode <= 539999: return "Andhra Pradesh"
            if 560000 <= pincode <= 599999: return "Karnataka"
            if 400000 <= pincode <= 449999: return "Maharashtra"
            if 110000 <= pincode <= 119999: return "Delhi"
            if 600000 <= pincode <= 669999: return "Tamil Nadu"

        # Default Fallback
        return "Telangana"

    @staticmethod
    def calculate_gst(customer_state_name: str = None):
        """
        Determines Tax Type and breakdown based on customer state name.
        """
        state_name = customer_state_name or GSTCalculator.HQ_STATE_NAME
        state_code = GSTCalculator.STATE_CODE_MAPPING.get(state_name, GSTCalculator.HQ_STATE_CODE)

        if state_code == GSTCalculator.HQ_STATE_CODE:
            tax_type = "Intra-State"
            cgst = 83.90 * 0.09
            sgst = 83.90 * 0.09
            igst = 0.00
        else:
            tax_type = "Inter-State"
            cgst = 0.00
            sgst = 0.00
            igst = 15.10 # 83.90 * 0.18 approx

        return {
            "base_price": 83.90,
            "gst_total": 15.10,
            "cgst": round(cgst, 2),
            "sgst": round(sgst, 2),
            "igst": round(igst, 2),
            "total": 99.00,
            "tax_type": tax_type,
            "state_code": state_code,
            "state_name": state_name
        }

class InvoiceEngine:
    @staticmethod
    def calculate_tax_breakdown(amount_paid, customer_state):
        """
        Determines Place of Supply based on Telangana HQ Rule.
        """
        HQ_STATE = "Telangana"
        tax_rate = 0.18
        taxable_value = round(amount_paid / (1 + tax_rate), 2)
        total_tax = round(amount_paid - taxable_value, 2)
        
        # Section 12 IGST Act Logic
        if not customer_state or customer_state.title() == HQ_STATE:
            return {
                "type": "INTRA",
                "taxable_value": taxable_value,
                "cgst": round(total_tax / 2, 2),
                "sgst": round(total_tax / 2, 2),
                "igst": 0.00
            }
        else:
            return {
                "type": "INTER",
                "taxable_value": taxable_value,
                "cgst": 0.00,
                "sgst": 0.00,
                "igst": total_tax
            }

    @staticmethod
    def generate_gst_invoice(user_name, transaction_id, customer_state, amount=99.00):
        """
        Generates PDF. Returns file path.
        """
        tax_info = InvoiceEngine.calculate_tax_breakdown(amount, customer_state)
        
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{transaction_id[:4]}"
        
        # Cross-platform path handling
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
        c.drawString(350, height - 50, "ORIGINAL FOR RECIPIENT")
        c.drawString(350, height - 70, f"Date: {datetime.now().strftime('%d-%b-%Y')}")
        c.drawString(350, height - 85, f"Invoice #: {invoice_number}")
        
        # -- Financial Table --
        y = height - 200
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, y, "Description: Monthly Compliance Locker")
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
        c.drawString(50, 50, "Terms: This is a computer generated invoice and does not require a physical signature.")
        
        c.save()
        return filename

class ReportingService:
    @staticmethod
    def export_gstr1(records: list):
        """
        Exports sales register records to Excel in GSTR-1 format.
        """
        df = pd.DataFrame(records)
        # Mocking GSTR-1 columns
        # In reality, this would map to B2C or B2B sheets
        output_file = f"/tmp/GSTR1_Report_{datetime.now().strftime('%Y%m')}.xlsx"
        if os.name == 'nt':
            output_file = f"GSTR1_Report_{datetime.now().strftime('%Y%m')}.xlsx"
        
        df.to_excel(output_file, index=False)
        return output_file
