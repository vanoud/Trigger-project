# Déploiement du projet TRIGGER sous GCP avec Terraform

# Le fichier doit être sauvé avec les fins de ligne LF (Linux), pour que le script de démarrage des VM ne contienne pas de caractères problématiques.

# Appel des providers Google Cloud et null
terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "~>4.19.0"
        }
    }
}

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

# Création d'une IP publique
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
        # 20220503: Par défaut, non activé car encore en beta.
        # provisioning_model = "STANDARD"
    }
    # Le log du script peut être consulté sur la VM avec la commande suivante : sudo journalctl -u google-startup-scripts.service
    metadata_startup_script = <<-EOS
        #!/bin/bash
        apt-get update && apt-get upgrade -y && apt-get install python3-pip gunicorn -y && apt-get autoremove -y
        cd ~
        git clone https://github.com/vanoud/Trigger-project.git
        cd Trigger-project/
        pip install -r requirements.txt
        gunicorn -D -w 4 -b 0.0.0.0:5000 app:app
        EOS
}

# Création d'un groupe d'instances
# compute & autoscaling
# ressource "google_compute_instance_group" "instance_group_trigger" {
#     name = "trigger_instance_group"
#     zone = var.project_zone
# }

# Création d'un Load Balancer
#network services
# https://cloud.google.com/load-balancing/docs/https/ext-http-lb-tf-module-examples
