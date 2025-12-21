provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. VPC Design
resource "google_compute_network" "vpc" {
  name                    = "compliancedesk-prod-vpc"
  auto_create_subnetworks = false
}

# Subnets
resource "google_compute_subnetwork" "public_ingress" {
  name          = "public-ingress"
  ip_cidr_range = "10.0.1.0/24"
  region        = "asia-south1"
  network       = google_compute_network.vpc.id
}

resource "google_compute_subnetwork" "private_app" {
  name          = "private-app"
  ip_cidr_range = "10.0.2.0/24"
  region        = "asia-south1"
  network       = google_compute_network.vpc.id
}

resource "google_compute_subnetwork" "private_data" {
  name                     = "private-data"
  ip_cidr_range            = "10.0.3.0/24"
  region                   = "asia-south1"
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true
}
