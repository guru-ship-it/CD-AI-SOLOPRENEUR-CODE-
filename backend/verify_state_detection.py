from services.finance_service import GSTCalculator

def test_state_detection():
    test_cases = [
        {"text": "Address: Banglore, Karnataka - 560001", "expected": "Karnataka"},
        {"text": "Hyderabad, TS 500081", "expected": "Telangana"},
        {"text": "Mumbai, Maharashtra 400001", "expected": "Maharashtra"},
        {"text": "Chennai, TN 600001", "expected": "Tamil Nadu"},
        {"text": "New Delhi - 110001", "expected": "Delhi"},
        {"text": "Unknown area 123456", "expected": "Telangana"}, # Fallback
        {"text": "Telangana State", "expected": "Telangana"},
        {"text": "Rangareddy district", "expected": "Telangana"}
    ]

    for case in test_cases:
        result = GSTCalculator.detect_state_from_ocr(case["text"])
        print(f"Input: {case['text']}\nExpected: {case['expected']}\nResult: {result}\n{'✅ PASS' if result == case['expected'] else '❌ FAIL'}\n")

if __name__ == "__main__":
    test_state_detection()
