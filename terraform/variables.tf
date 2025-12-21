variable "project_id" {
  description = "The GCP Project ID"
  type        = string
  default     = "your-project-id" # Helper for validation, user overrides this
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "asia-south1"
}
