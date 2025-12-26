import json
import requests
from unittest.mock import MagicMock, patch

# Mocking Firebase Functions environment
class MockRequest:
    def __init__(self, data):
        self.data = data
        self.headers = {'X-Razorpay-Signature': 'mock_sig'}
    def get_json(self):
        return self.data
    def get_data(self, as_text=False):
        return json.dumps(self.data)

def simulate_webhook():
    print("Simulating Razorpay Webhook Call...")
    
    mock_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_TEST_12345",
                    "amount": 9900,
                    "currency": "INR",
                    "notes": {"user_id": "user_123"}
                }
            }
        }
    }
    
    req = MockRequest(mock_payload)
    
    # We need to mock the get_secret to return something safe for the demo
    with patch('app.get_secret', return_value='YOUR_WEBHOOK_SECRET'), \
         patch('razorpay.Client') as mock_razorpay, \
         patch('services.finance_service.InvoiceEngine.generate_gst_invoice', return_value='/tmp/mock_invoice.pdf') as mock_gen_invoice:
        
        from main import razorpay_webhook
        
        # Mocking signature verification to pass
        mock_client = mock_razorpay.return_value
        mock_client.utility.verify_webhook_signature.return_value = True
        
        response = razorpay_webhook(req)
        
        print(f"Webhook Status Code: {response.status_code}")
        print(f"Webhook Response Body: {response.data}")
        
        if mock_gen_invoice.called:
            print("✅ generate_gst_invoice was called!")
            args, kwargs = mock_gen_invoice.call_args
            print(f"Called with args: {args}")
        else:
            print("❌ generate_gst_invoice was NOT called.")

if __name__ == "__main__":
    simulate_webhook()
