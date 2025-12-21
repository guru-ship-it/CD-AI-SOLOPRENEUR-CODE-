# Cloud Run Services

# Service A: API (Producer)
resource "google_cloud_run_service" "api" {
  name     = "api"
  location = "asia-south1"

  template {
    spec {
      containers {
        image = "gcr.io/google-samples/hello-app:1.0"

        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }
        env {
          name  = "REDIS_PORT"
          value = google_redis_instance.cache.port
        }
        env {
          name  = "ROLE"
          value = "API"
        }

        # Mount Secrets
        volume_mounts {
          name       = "secrets-volume"
          mount_path = "/secrets"
        }
      }

      volumes {
        name = "secrets-volume"
        secret {
          secret_name = google_secret_manager_secret.protean_api_key.secret_id
          items {
            key  = "latest"
            path = "protean_key"
          }
        }
        # Note: Cloud Run Gen1 supports one 'secret' volume per mount mostly, 
        # but modern implementations allow multiple items or multiple volumes.
        # For simplicity in HCL, we might need separate volumes or use 'items' if they come from same secret (they don't).
        # Cloud Run actually supports multiple secrets in one service.
        # Let's add multiple volumes for clarity or use env vars from secrets if simpler.
        # User requested "Mount as Volumes".
      }
      # Terraform google provider for Cloud Run v1 is tricky with multiple secret volumes.
      # Re-attempting efficient syntax: 
      # Actually, mounting multiple secrets to the same path requires separate volume definitions mapping to same directory? 
      # No, containers allow multiple mounts.
      # Let's try ONE volume per secret for safety in Terraform logic or assume we can handle one.
      # Strategy: Define separate volumes for each secret and mount them to distinct paths or subpaths.
      # Simplified: Just mount the Protean key for now as requested by the specific prompt "Protean Gateway".
      # Wait, user said "Mount secrets as Volumes".
      # Let's do env vars from secrets for simplicity where possible? 
      # "Mounting: Mount secrets as Volumes in Cloud Run (More secure than Env Vars)." -> Constraint is strict.

      # Correct approach for multiple secrets:
      volumes {
        name = "protean-secret"
        secret {
          secret_name = google_secret_manager_secret.protean_api_key.secret_id
          items {
            key  = "latest"
            path = "protean_key"
          }
        }
      }
      volumes {
        name = "whatsapp-secret"
        secret {
          secret_name = google_secret_manager_secret.whatsapp_token.secret_id
          items {
            key  = "latest"
            path = "whatsapp_token"
          }
        }
      }
      volumes {
        name = "uidai-secret"
        secret {
          secret_name = google_secret_manager_secret.uidai_cert.secret_id
          items {
            key  = "latest"
            path = "uidai_cert.p12"
          }
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = "projects/${var.project_id}/locations/asia-south1/connectors/connector"
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
      }
    }
  }
}

# Service B: Worker (Consumer)
resource "google_cloud_run_service" "worker" {
  name     = "worker"
  location = "asia-south1"

  template {
    spec {
      containers {
        image = "gcr.io/google-samples/hello-app:1.0"

        args = ["celery", "-A", "backend.celery_config", "worker", "--loglevel=info"]

        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }
        env {
          name  = "REDIS_PORT"
          value = google_redis_instance.cache.port
        }
        env {
          name  = "ROLE"
          value = "WORKER"
        }

        # Mount same secrets
        volume_mounts {
          name       = "protean-secret"
          mount_path = "/secrets/protean"
        }
        volume_mounts {
          name       = "whatsapp-secret"
          mount_path = "/secrets/whatsapp"
        }
        volume_mounts {
          name       = "uidai-secret"
          mount_path = "/secrets/uidai"
        }
      }

      volumes {
        name = "protean-secret"
        secret {
          secret_name = google_secret_manager_secret.protean_api_key.secret_id
          items {
            key  = "latest"
            path = "key"
          }
        }
      }
      volumes {
        name = "whatsapp-secret"
        secret {
          secret_name = google_secret_manager_secret.whatsapp_token.secret_id
          items {
            key  = "latest"
            path = "token"
          }
        }
      }
      volumes {
        name = "uidai-secret"
        secret {
          secret_name = google_secret_manager_secret.uidai_cert.secret_id
          items {
            key  = "latest"
            path = "cert.p12"
          }
        }
      }

      # Worker scaling
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = "projects/${var.project_id}/locations/asia-south1/connectors/connector"
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
        "autoscaling.knative.dev/minScale"        = "1"
        "autoscaling.knative.dev/maxScale"        = "10"
      }
    }
  }
}
