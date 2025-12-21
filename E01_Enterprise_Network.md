# Mission: Enterprise Network Foundation
**Role:** Principal Network Architect
**Target:** `asia-south1` (Mumbai)

## 1. VPC Design (Terraform)
* **Create VPC:** `compliancedesk-prod-vpc`.
* **Subnets:**
    * `public-ingress`: For Load Balancer only.
    * `private-app`: For Cloud Run Connectors (Serverless VPC Access).
    * `private-data`: For Cloud SQL & Redis (No Public IP).
* **Firewall Rules:**
    * **Deny All Ingress** by default.
    * **Allow Internal:** Only allow traffic on port 5432 (SQL) and 6379 (Redis) from `private-app`.

## 2. Cloud Armor (WAF)
* **Policy:** `compliancedesk-security-policy`.
* **Rules:**
    * **Geo-Fencing:** Deny traffic from non-India IPs (Optional, but good for Compliance).
    * **Rate Limiting:** Max 100 requests/minute per IP (Prevent DDoS).
    * **SQLi/XSS:** Enable OWASP Core Rule Set.

## 3. Global Load Balancer
* **Frontend:** Anycast IP (Single static IP for the world).
* **Backend:** Serverless NEG (Network Endpoint Group) pointing to Cloud Run.
