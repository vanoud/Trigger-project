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
    routing_mode = "REGIONAL"
}

# # Création d'une IP publique
resource "google_compute_address" "public_ip_trigger" {
    name = "trigger-public-ip"
    address_type = "EXTERNAL"
    network_tier = "PREMIUM"
}

# Création d'une règle de pare-feu
resource "google_compute_firewall" "fw_trigger" {
    name = "trigger-fw"
    network = google_compute_network.vpc_trigger.name
    direction = "INGRESS"
    target_tags = ["trigger-vm"]
    source_ranges = ["0.0.0.0/0"]

    allow {
      protocol = "icmp"
    }
    allow {
      protocol = "tcp"
      ports = ["22","5000"]
    }
}

# Création d'un modèle d'instance
# missing:  service account, scopes?
resource "google_compute_instance_template" "instance_template_trigger" {
    name = "trigger-instance-template"
    description = "Modèle de machine Virtuel pour le chat Trigger"
    tags = [ "trigger-vm" ]
    machine_type = var.vm_type

    disk {
      auto_delete = true
      disk_type = "pd-balanced"
      disk_size_gb = 10
      source_image = "ubuntu-2004-lts"
    }

    network_interface {
      network = google_compute_network.vpc_trigger.name
      access_config {
        network_tier = "PREMIUM"
      }
    }

    scheduling {
        automatic_restart   = true
        on_host_maintenance = "MIGRATE"
        # provisioning_model = "STANDARD"
    }

    metadata_startup_script = <<-EOS
            cd ~ \n
            sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get install git -y \n
            git clone https://github.com/vanoud/Trigger-project.git \n
            sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get install python3-pip -y \n
            cd Trigger-project/ \n
            pip install -r requirements.txt \n
            sudo apt-get install gunicorn -y \n
            gunicorn -D -w 4 -b 0.0.0.0:5000 app:app \n
            EOS
}

# Création d'un groupe d'instances
# compute & autoscaling

# Création d'un Load Balancer
#network services
