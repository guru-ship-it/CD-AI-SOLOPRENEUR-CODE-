resource "google_sql_database_instance" "master" {
  name             = "compliancedesk-prod-db"
  database_version = "POSTGRES_15"
  region           = var.region

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    # Enterprise Plus (Sandbox/Enterprise/Enterprise Plus)
    # Using Enterprise Plus as requested for Mission 3
    tier = "db-perf-optimized-N-2" # Example Enterprise Plus machine type (Check availability)
    # Note: "db-custom-..." types are standard. Enterprise Plus often uses specific editions.
    # For Terraform, edition is set in settings.

    edition = "ENTERPRISE_PLUS"

    availability_type = "REGIONAL" # High Availability

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00" # UTC
    }

    disk_size = 100
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
