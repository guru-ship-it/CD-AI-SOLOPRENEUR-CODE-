# Secret Manager Definitions

# 1. Protean API Key
resource "google_secret_manager_secret" "protean_api_key" {
  secret_id = "PROTEAN_PROD_API_KEY"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "protean_default" {
  secret      = google_secret_manager_secret.protean_api_key.id
  secret_data = "dummy-protean-key-change-me" # Placeholder for init
}

# 2. WhatsApp Token
resource "google_secret_manager_secret" "whatsapp_token" {
  secret_id = "WHATSAPP_PROD_TOKEN"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "whatsapp_default" {
  secret      = google_secret_manager_secret.whatsapp_token.id
  secret_data = "dummy-whatsapp-token-change-me"
}

# 3. UIDAI Certificate (P12)
resource "google_secret_manager_secret" "uidai_cert" {
  secret_id = "UIDAI_CERTIFICATE_P12"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "uidai_default" {
  secret      = google_secret_manager_secret.uidai_cert.id
  secret_data = base64encode("dummy-p12-content") # Encoded for binary safety
}

# IAM Binding to allow Cloud Run to access secrets
# NOTE: Commented out for initial deployment. Reconfigure with actual Cloud Run SA.
# resource "google_secret_manager_secret_iam_member" "api_access_protean" {
#   secret_id = google_secret_manager_secret.protean_api_key.id
#   role      = "roles/secretmanager.secretAccessor"
#   member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com" # Adjust if using custom SA
# }
#
# resource "google_secret_manager_secret_iam_member" "api_access_whatsapp" {
#   secret_id = google_secret_manager_secret.whatsapp_token.id
#   role      = "roles/secretmanager.secretAccessor"
#   member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
# }
