# 2. Cloud Armor (WAF)

resource "google_compute_security_policy" "policy" {
  name = "compliancedesk-security-policy"

  # Rule 1: STRICT Geo-Fencing - Deny Non-India IPs
  rule {
    action   = "deny(403)"
    priority = "900"
    match {
      expr {
        expression = "origin.region_code != 'IN'"
      }
    }
    description = "Mandatory: Deny traffic from non-India IPs"
  }

  # Rule 2: Rate Limiting
  rule {
    action   = "rate_based_ban"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Rate limit: 100 requests per minute"
  }

  # Rule 3: OWASP Core Rule Set (SQLi/XSS prevention)
  rule {
    action   = "deny(403)"
    priority = "3000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable') || evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "OWASP CRS protection for XSS and SQLi"
  }

  # Default Rule (REQUIRED) - Allow all remaining traffic
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default rule - allow all remaining traffic"
  }
}
