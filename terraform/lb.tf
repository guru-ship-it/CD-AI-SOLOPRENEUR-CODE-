# 3. Global Load Balancer

# Reserve a Global Static IP
resource "google_compute_global_address" "default" {
  name = "compliancedesk-ip"
}

# Backend Service
resource "google_compute_backend_service" "default" {
  name                  = "compliancedesk-backend"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL"
  security_policy       = google_compute_security_policy.policy.id

  backend {
    group = google_compute_region_network_endpoint_group.serverless_neg.id
  }
}

# Serverless NEG (Network Endpoint Group) for Cloud Run
resource "google_compute_region_network_endpoint_group" "serverless_neg" {
  name                  = "compliancedesk-neg"
  network_endpoint_type = "SERVERLESS"
  region                = "asia-south1"
  cloud_run {
    service = "api" # Assuming your Cloud Run service is named 'api'
  }
}

# URL Map
resource "google_compute_url_map" "default" {
  name            = "compliancedesk-url-map"
  default_service = google_compute_backend_service.default.id
}

# Target HTTPS Proxy
# Note: Requires an SSL Certificate. For demo, we might use HTTP or managed certs.
# Using managed cert for example.
resource "google_compute_managed_ssl_certificate" "default" {
  name = "compliancedesk-cert"

  managed {
    domains = ["api.compliancedesk.ai"] # Replace with actual domain
  }
}

resource "google_compute_target_https_proxy" "default" {
  name             = "compliancedesk-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# Forwarding Rule
resource "google_compute_global_forwarding_rule" "default" {
  name       = "compliancedesk-forwarding-rule"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.address
}
