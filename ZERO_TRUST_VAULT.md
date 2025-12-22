# Zero Trust Architecture: The Vault Pattern

## 1. Objective
Achieve "Skyflow-like" data isolation where the primary database contains **zero** personal data. Even a full database dump yields only useless tokens.

## 2. Architecture
### The Public Zone (Main Level)
*   **Collection**: `users`, `verifications`
*   **Content**: Business logic data and **Tokens**.
*   **Example**:
    ```json
    {
      "uid": "user_123",
      "name_token": "tok_nm_8x92kz",
      "aadhaar_token": "tok_id_9s8d7f",
      "status": "VERIFIED"
    }
    ```
*   **Access**: Readable by Frontend (with Rules).

### The Vault (Restricted Level)
*   **Collection**: `pii_vault`
*   **Content**: The actual PII mapping.
*   **Example**:
    ```json
    {
      "key": "tok_nm_8x92kz",
      "value": "Guru",
      "encryption": "AES-256" // Double layer: Tokenized AND Encrypted
    }
    ```
*   **Access**: **STRICTLY DENIED** to Client SDKs. Only accessible via Cloud Functions (`admin-sdk`).

## 3. Implementation Logic
### Write Flow
1.  Frontend sends PII to Cloud Function `secureOnboard`.
2.  Function generates Token (`tok_...`).
3.  Function writes `Token -> PII` to `pii_vault`.
4.  Function returns `Token` to Frontend.
5.  Frontend saves `Token` to `users` collection.

### Read Flow
1.  Authorized Admin requests data via Cloud Function `revealData`.
2.  Function checks permissions (RBAC).
3.  Function resolves `Token -> PII` from `pii_vault`.
4.  Function returns PII temporarily to Admin.
