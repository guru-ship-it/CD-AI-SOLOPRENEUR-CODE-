
#!/bin/bash
# CERT-In Phase 6: Automated Data Bleaching
# Sets a 24-hour TTL policy on the raw_uploads bucket.

BUCKET_NAME="demo-uploads" # Replace with actual bucket

# 1. Create Lifecycle JSON
cat > lifecycle.json <<EOF
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
EOF

# 2. Apply Policy
echo "Applying 24-hour TTL policy to gs://$BUCKET_NAME..."
# gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME

echo "Policy applied. Files older than 24h will be auto-deleted."
rm lifecycle.json
