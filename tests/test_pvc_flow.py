from fastapi.testclient import TestClient
from backend.main import app, USER_SESSIONS

client = TestClient(app)

def test_pvc_bot_flow():
    user_id = "test_user_999"
    USER_SESSIONS.clear()

    # 1. Start Flow
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "POLICE"})
    assert resp.status_code == 200
    data = resp.json()
    assert "Select your Work Location" in data["response"]
    assert data["next_state"] == "SELECT_LOCATION"

    # 2. Select Location (Hyderabad)
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "1"})
    data = resp.json()
    assert "Selected: TS" in data["response"]
    assert "Do you already have a Police Certificate?" in data["response"]
    assert data["next_state"] == "CHECK_EXISTING"

    # 3. Simulate "NO" (Application Generation)
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "NO"})
    data = resp.json()
    assert "We will help you apply" in data["response"]
    assert data["next_state"] == "AWAITING_NAME_FOR_APP"

    # 4. Provide Name
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "Raju Bhai"})
    data = resp.json()
    assert "Form Generated" in data["response"]
    assert "application_TS" in data["response"]
    assert data["next_state"] == "START"

def test_pvc_status_check():
    user_id = "status_user_888"
    USER_SESSIONS.clear()
    
    # Pre-set state to simulate jumping to status check (or walk through)
    # Walking through...
    client.post("/whatsapp/hook", json={"user_id": user_id, "message": "POLICE"})
    client.post("/whatsapp/hook", json={"user_id": user_id, "message": "1"}) # TS
    
    # Say APPLIED
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "APPLIED"})
    assert resp.json()["next_state"] == "AWAITING_APP_ID"

    # Provide App ID
    resp = client.post("/whatsapp/hook", json={"user_id": user_id, "message": "HYD123456"})
    data = resp.json()
    assert "Current Status" in data["response"]
    assert "PENDING" in data["response"] # Based on mock logic
