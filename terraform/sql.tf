resource "google_sql_database_instance" "master" {
  name             = "compliancedesk-prod-db"
  database_version = "POSTGRES_15"
  region           = var.region

  # depends_on commented out - PSA peering not configured in this deployment
  # depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    # Using standard tier for initial deployment
    tier = "db-f1-micro" # Smallest tier for demo

    # Enterprise Plus requires specific setup, using standard for now
    # edition = "ENTERPRISE_PLUS"

    availability_type = "ZONAL" # Simplified for demo

    ip_configuration {
      ipv4_enabled    = true  # Enable public IP for demo
      # private_network = google_compute_network.vpc.id # Requires PSA peering
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00" # UTC
    }

    disk_size = 10  # Smaller for demo
    disk_type = "PD_SSD"
  }

  deletion_protection = false # For demo ease, set true for real prod
}

resource "google_sql_database" "database" {
  name     = "compliancedesk_db"
  instance = google_sql_database_instance.master.name
}

resource "google_sql_user" "users" {
  name     = "compliance_user"
  instance = google_sql_database_instance.master.name
  password = "changeme123" # In production, use Secret Manager
}
