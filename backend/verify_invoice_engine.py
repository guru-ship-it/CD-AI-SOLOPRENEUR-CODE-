from services.finance_service import InvoiceEngine
import os

def test_invoice_engine():
    print("Testing InvoiceEngine...")
    
    # Test Cases
    test_cases = [
        {"name": "Arjun Kumar", "id": "123456789012", "state": "Telangana", "amount": 99.00},
        {"name": "Sandeep Charkha", "id": "987654321098", "state": "Maharashtra", "amount": 99.00},
        {"name": "Anonymous", "id": "000000000000", "state": None, "amount": 199.00}
    ]
    
    for case in test_cases:
        print(f"\nGenerating invoice for {case['name']} in {case['state']}...")
        tax_info = InvoiceEngine.calculate_tax_breakdown(case['amount'], case['state'])
        print(f"Tax Breakdown: {tax_info}")
        
        pdf_path = InvoiceEngine.generate_gst_invoice(case['name'], case['id'], case['state'], case['amount'])
        print(f"PDF Generated: {pdf_path}")
        
        if os.path.exists(pdf_path):
            print("✅ File exists.")
        else:
            print("❌ File NOT found.")

if __name__ == "__main__":
    test_invoice_engine()
