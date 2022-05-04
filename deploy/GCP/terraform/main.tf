# Déploiement du projet TRIGGER sous GCP avec Terraform

# Le fichier doit être sauvé avec les fins de ligne LF (Linux), pour que le script de démarrage des VM ne contienne pas de caractères problématiques.
# Pour éviter que git change les formats de fin de ligne de manière intempestive :
# https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings -> git config --global core.autocrlf false

# Appel du provider Google Cloud
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

# Autoscaling pour le groupe d'instances
resource "google_compute_autoscaler" "autoscaler_trigger" {
    name = "trigger-autoscaler"
    target = google_compute_instance_group_manager.instance_group_manager_trigger.id

    autoscaling_policy {
        min_replicas = 1
        max_replicas = 3
        cooldown_period = 480

        cpu_utilization {
            target = 0.9
            predictive_method = "NONE"
        }
    }
}

# Pool cible pour le groupe d'instance
resource "google_compute_target_pool" "target_pool_trigger" {
  name = "trigger-target-pool"
}

# Création d'une sonde de santé pour le groupe d'instances
# resource "google_compute_health_check" "autohealing" {
#     name =""
# }

# Création du groupe d'instances
resource "google_compute_instance_group_manager" "instance_group_manager_trigger" {
    name = "trigger-instance-group-manager"
    zone = var.project_zone
    base_instance_name = "trigger-vm"
    target_pools = [google_compute_target_pool.target_pool_trigger.id]

    # Appel du modèle
    version {
        name = "trigger-appserver-demo"
        instance_template = google_compute_instance_template.instance_template_trigger.id
    }

    # Ouverture du port adéquat
    named_port {
        name = "trigger-app-5000"
        port = 5000
    }

    # Politique de résilience
    # auto_healing_policies {
    #     health_check = ""
    #     initial_delay_sec = "240"
    # }

    # Politique de màj de configuration
    update_policy {
        type = "PROACTIVE"
        minimal_action = "REPLACE"
        max_surge_fixed = 2
    }
}

# Création d'un Load Balancer
#network services
# https://cloud.google.com/load-balancing/docs/https/ext-http-lb-tf-module-examples
