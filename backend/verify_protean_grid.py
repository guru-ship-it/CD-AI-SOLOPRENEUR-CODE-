import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.protean_service import gateway

def test_grid_gateway():
    print("--- PROTEAN GRID GATEWAY VERIFICATION ---")
    
    # 1. Test Core Verification (Vehicle RC)
    print("\n[1] Testing Vehicle RC Cell...")
    res_rc = gateway.execute("vehicle_rc", {"rc_number": "AB12CD3456"})
    print(f"Result: {res_rc}")

    # 2. Test Identity Grid (Voter ID)
    print("\n[2] Testing Voter ID Cell...")
    res_voter = gateway.execute("voter_id", {"epic_number": "VOT1234567"})
    print(f"Result: {res_voter}")

    # 3. Test Utility Grid (Electricity Bill)
    print("\n[3] Testing Electricity Bill Cell...")
    res_elec = gateway.execute("electricity_bill", {"consumer_id": "100200", "provider_id": "BEST"})
    print(f"Result: {res_elec}")

    # 4. Test Logistics Grid (Reverse RC)
    print("\n[4] Testing Reverse RC Cell...")
    res_rev = gateway.execute("vehicle_reverse_rc", {"engine_number": "ENG123", "chassis_number": "CHA456"})
    print(f"Result: {res_rev}")

    # 5. Test Invalid Slug
    print("\n[5] Testing Missing Cell...")
    res_fail = gateway.execute("non_existent_api", {})
    print(f"Result: {res_fail}")

    print("\n--- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    test_grid_gateway()
