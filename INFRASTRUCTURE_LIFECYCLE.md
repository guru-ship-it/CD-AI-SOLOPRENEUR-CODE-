# Infrastructure Lifecycle & Data Bleaching

## Objective
Enforce strict "Storage Limitation" principles as per DPDP Act 2023.

## 1. Cloud Storage Lifecycle (Data Bleaching)
**Target Bucket:** `raw_uploads`
**Policy:** Delete all objects older than 24 hours.

### `lifecycle.json` Configuration
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": { "age": 1 }
      }
    ]
  }
}
```

### Deployment Command
```bash
gsutil lifecycle set lifecycle.json gs://your-project-id-raw-uploads
```

## 2. Firestore TTL Policies
**Target Collection:** `consent_ledger` (Optional)
**Policy:** If consent expires or is withdrawn, data should be archived.

**Target Collection:** `audit_logs`
**Policy:** Retain for 7 years (Legal Requirement), then delete.
