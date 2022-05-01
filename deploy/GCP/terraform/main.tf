# Déploiement du projet TRIGGER sous GCP avec Terraform

# Appel des providers Google Cloud et null
terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "~>4.19.0"
        }
        # time = {
        #     source = "hashicorp/time"
        #     version = "~>0.7.2"
        # }
        null = {
            source = "hashicorp/null"
            version = "~>3.1.1"
        }
    }
}

# Configuration du provider null
provider "null" {}

# Configuration du provider Google Cloud
provider "google" {
    project = var.project_id
    region = var.project_region
    zone = var.project_zone
}

# Création de la VPC
resource "google_compute_network" "vpc_trigger" {
  name = "trigger-vpc"
  auto_create_subnetworks = "true"
  routing_mode = "GLOBAL"
}

