# WORM Backup Configuration (Nuclear-Proof Safeguard)
# Goal: Create a bucket that even Admins cannot delete for 90 days.

resource "google_storage_bucket" "immutable_backups" {
  name          = "compliancedesk-worm-backups-delhi"
  location      = "ASIA-SOUTH2" # Secondary Region: Delhi
  storage_class = "COLDLINE"

  # Force destroy set to false to prevent accidental deletion during terraform destroy
  force_destroy = false

  versioning {
    enabled = true
  }

  # THE NUCLEAR OPTION: Bucket Lock
  # Once this is applied and the lock is set to "LOCKED", 
  # NO ONE (not even the project owner) can delete objects 
  # until they are 90 days old.
  retention_policy {
    is_locked        = true
    retention_period = 7776000 # 90 days in seconds
  }

  lifecycle_rule {
    condition {
      age = 365 # Keep for a year, but lock for first 90 days
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    "security-tier" = "nuclear-proof"
    "compliance"    = "ransomware-immunity"
  }
}
# Raw KYC Image Storage (24-Hour Bleaching)
# Goal: Ensure PII images are auto-deleted after 24 hours for DPDP/GDPR compliance.

resource "google_storage_bucket" "raw_kyc_images" {
  name          = "compliancedesk-raw-kyc-images-mumbai"
  location      = "ASIA-SOUTH1"
  storage_class = "STANDARD"

  force_destroy = true

  lifecycle_rule {
    condition {
      age = 1 # 1 day
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    "security-tier" = "bleached-storage"
    "compliance"    = "data-minimization"
  }
}
