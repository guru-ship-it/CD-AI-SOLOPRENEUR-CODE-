# 📘 Admin Manual: Master Registry Search

## Global Identity Search
**Purpose**: Instantly check if a mobile number has ever been verified on the platform, preventing duplicate checks and high-cost repeat verifications.

### How to Use (API)
To search for a user programmatically, make a GET request to the Master Registry endpoint.

**Endpoint**: `GET https://[YOUR-URL]/api/users/search`  
**Header**: `Authorization: Bearer [ADMIN_TOKEN]`  
**Parameter**: `mobile` (Format: 10 digits or with country code)

### Sample Request (cURL)
```bash
curl -X GET "https://api.compliancedesk.ai/users/search?mobile=9876543210" \
     -H "Authorization: Bearer admin-secret-key"
```

### Response (Success)
```json
{
  "status": "found",
  "applicant_name": "Rajesh Kumar",
  "verified_at": "2024-05-20T10:30:00Z",
  "expiry_date": "2025-05-20T00:00:00Z",
  "tenant_owner": "Logistics_North_Zone",
  "registry_id": 4021
}
```

### Response (Not Found)
```json
{
  "status": "not_found",
  "detail": "User does not exist in the Master Registry."
}
```
