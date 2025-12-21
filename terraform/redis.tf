# Cloud MemoryStore (Redis)

resource "google_redis_instance" "cache" {
  name           = "compliancedesk-redis"
  tier           = "BASIC" # or STANDARD_HA for production
  memory_size_gb = 1
  region         = "asia-south1"

  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_version = "REDIS_6_X"
  display_name  = "ComplianceDesk Redis"

  # Note: Private Service Access requires a global address range and VPC peering.
  # For simplicity in this demo, we might skip full PSA setup complexity if strictly not needed,
  # but for Enterprise VPC compliance (Mission 1), we should ideally have it.
  # If PSA errors occur, we can fallback to just authorized_network or handle the peering dependency.
}

# NOTE: Real-world VPC Peering for Redis needs 'google_compute_global_address' and 'google_service_networking_connection'
# Commented out for initial deployment - requires Service Networking API and peering setup.
# Can be re-enabled after: gcloud services enable servicenetworking.googleapis.com

# resource "google_compute_global_address" "private_ip_alloc" {
#   name          = "private-ip-alloc"
#   purpose       = "VPC_PEERING"
#   address_type  = "INTERNAL"
#   prefix_length = 16
#   network       = google_compute_network.vpc.id
# }

# resource "google_service_networking_connection" "private_vpc_connection" {
#   network                 = google_compute_network.vpc.id
#   service                 = "servicenetworking.googleapis.com"
#   reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
# }
