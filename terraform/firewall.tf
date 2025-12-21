# Firewall Rules

# Deny All Ingress by default (Implicit in GCP, but good to be explicit or log)
resource "google_compute_firewall" "deny_all" {
  name    = "deny-all-ingress"
  network = google_compute_network.vpc.name

  deny {
    protocol = "all"
  }

  priority      = 65534 # Lower priority than allow rules
  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
}

# Allow Internal: Only allow traffic on port 5432 (SQL) and 6379 (Redis) from private-app
resource "google_compute_firewall" "allow_internal_data" {
  name    = "allow-internal-data"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["5432", "6379"]
  }

  source_ranges = ["10.0.2.0/24"] # IP range of private-app subnet
  target_tags   = ["data-layer"]  # Apply to instances/services with this tag
}

# Allow Internal Communication within App Subnet (if needed)
resource "google_compute_firewall" "allow_internal_app" {
  name    = "allow-internal-app"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
  }
  allow {
    protocol = "udp"
  }
  allow {
    protocol = "icmp"
  }
  source_ranges = ["10.0.2.0/24"]
}
