# Skyflow Vault Pattern Architecture

## 1. Core Philosophy
**"What you don't have, can't be stolen."**
The primary application database (`users`, `orders`) contains **zero** PII (Personally Identifiable Information). It stores only Tokens (UUIDs).

## 2. Infrastructure Components
### The Vault (`secure_vault`)
*   **Database**: Firestore Collection.
*   **Access Rule**: `allow read, write: if false;` (Strictly No Client Access).
*   **Encryption**: Field-Level Encryption (AES-256) before storage.
*   **Data Structure**:
    ```json
    {
       "id": "tok_123456",
       "value": "ENCRYPTED_BLOB",
       "metadata": { "kind": "mobile", "algo": "aes-256" }
    }
    ```

### The Tokenizer (`secureOnboard`)
*   **Input**: Raw PII (Mobile, Aadhaar).
*   **Process**: Encrypt -> Store in Vault -> Generate Token.
*   **Output**: Non-sensitive Tokens (`tok_123`, `tok_456`).
*   **Storage**: Frontend saves ONLY these tokens to the public `users` collection.

### The Detokenizer (`detokenizeField`)
*   **Input**: Token ID (`tok_123`).
*   **Process**:
    1.  **Auth Check**: Is Master Admin?
    2.  **Audit Log**: "Admin X accessed Token Y at Time Z".
    3.  **Decrypt**: Retrieve blob -> Decrypt.
*   **Output**: Plaintext PII (Temporary View).

## 3. Compliance Benefits
*   **GDPR**: Right to be Forgotten = Delete 1 doc in Vault -> All backups/references become useless.
*   **Data Residency**: Vault can be pinned to specific regions (Mumbai).
*   **Plausible Deniability**: Main DB dumps look like gibberish.
