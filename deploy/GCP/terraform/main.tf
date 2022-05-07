# Déploiement du projet TRIGGER sous GCP avec Terraform

# Le fichier doit être sauvé avec les fins de ligne LF (Linux), pour que le script de démarrage des VM ne contienne pas de caractères problématiques.
# Pour éviter que git change les formats de fin de ligne de manière intempestive :
# https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings -> git config --global core.autocrlf false

# Appel du provider Google Cloud
terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "~>4.19.0, < 5.0"
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
    # auto_create_subnetworks = "true"
    auto_create_subnetworks = "false" # Pour lb
    routing_mode = "REGIONAL"
}

# Création d'une IP publique
resource "google_compute_global_address" "public_ip_trigger" {
    name = "trigger-public-ip"
    address_type = "EXTERNAL"
}

# Création d'une règle de pare-feu
resource "google_compute_firewall" "fw_trigger" {
    name = "trigger-fw"
    network = google_compute_network.vpc_trigger.name
    direction = "INGRESS"
    target_tags = ["trigger-vm"]
    source_ranges = ["0.0.0.0/0"]
    # For health check only:
    #source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]

    allow {
        protocol = "icmp"
    }

    allow {
        protocol = "tcp"
        ports = ["22","80"]
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
        #network = google_compute_network.vpc_trigger.name
        subnetwork = google_compute_subnetwork.backend_subnet_trigger.name #
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
        apt-get update && apt-get upgrade -y && apt-get install python3-pip gunicorn -y
        cd ~
        git clone https://github.com/vanoud/Trigger-project.git
        cd Trigger-project/
        pip install -r requirements.txt
        gunicorn -D -w 4 -b 0.0.0.0:80 app:app
        apt-get autoremove -y
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

# # Pool cible pour le groupe d'instance
# resource "google_compute_target_pool" "target_pool_trigger" {
#   name = "trigger-target-pool"
# }

# Création d'une sonde de santé pour le groupe d'instances
# resource "google_compute_health_check" "autohealing" {
#     name =""
# }

# Création du groupe d'instances
resource "google_compute_instance_group_manager" "instance_group_manager_trigger" {
    name = "trigger-instance-group-manager"
    zone = var.project_zone
    base_instance_name = "trigger-vm"
    #target_pools = [google_compute_target_pool.target_pool_trigger.id]

    # Appel du modèle
    version {
        name = "trigger-appserver-demo"
        instance_template = google_compute_instance_template.instance_template_trigger.id
    }

    # Ouverture du port adéquat
    named_port {
        name = "trigger-app-80"
        port = 80
    }

    # Sonde de santé
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


# Création d'un load balancer à la main
# # VPC
# resource "google_compute_network" "default" {
#   name                    = "l7-xlb-network"
#   provider                = google-beta
#   auto_create_subnetworks = false
# }

# backend subnet
resource "google_compute_subnetwork" "backend_subnet_trigger" {
  name          = "trigger-backend-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.project_region
  network       = google_compute_network.vpc_trigger.id
}

# # reserved IP address
# resource "google_compute_global_address" "default" {
#   provider = google-beta
#   name = "l7-xlb-static-ip"
# }

# forwarding rule
resource "google_compute_global_forwarding_rule" "forwarding_rule_trigger" {
  name                  = "trigger-forwarding-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_proxy_trigger.id
  ip_address            = google_compute_global_address.public_ip_trigger.id
}

# http proxy
resource "google_compute_target_http_proxy" "http_proxy_trigger" {
  name     = "trigger-http-proxy"
  url_map  = google_compute_url_map.url_map_trigger.id
}

# url map
resource "google_compute_url_map" "url_map_trigger" {
  name            = "trigger-url-map"
  default_service = google_compute_backend_service.backend_service_trigger.id
}

# backend service with custom request and response headers
resource "google_compute_backend_service" "backend_service_trigger" {
  name                     = "trigger-backend-service"
  protocol                 = "HTTP"
  port_name                = "trigger-app-80"
  load_balancing_scheme    = "EXTERNAL"
  timeout_sec              = 20
  health_checks            = [google_compute_health_check.hc_backserv_trigger.id]

  backend {
    group           = google_compute_instance_group_manager.instance_group_manager_trigger.instance_group
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }
}

# # instance template
# resource "google_compute_instance_template" "default" {
#   name         = "l7-xlb-mig-template"
#   provider     = google-beta
#   machine_type = "e2-small"
#   tags         = ["allow-health-check"]

#   network_interface {
#     network    = google_compute_network.default.id
#     subnetwork = google_compute_subnetwork.default.id
#     access_config {
#       # add external ip to fetch packages
#     }
#   }
#   disk {
#     source_image = "debian-cloud/debian-10"
#     auto_delete  = true
#     boot         = true
#   }

#   # install nginx and serve a simple web page
#   metadata = {
#     startup-script = <<-EOF1
#       #! /bin/bash
#       set -euo pipefail

#       export DEBIAN_FRONTEND=noninteractive
#       apt-get update
#       apt-get install -y nginx-light jq

#       NAME=$(curl -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/hostname")
#       IP=$(curl -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/ip")
#       METADATA=$(curl -f -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/attributes/?recursive=True" | jq 'del(.["startup-script"])')

#       cat <<EOF > /var/www/html/index.html
#       <pre>
#       Name: $NAME
#       IP: $IP
#       Metadata: $METADATA
#       </pre>
#       EOF
#     EOF1
#   }
#   lifecycle {
#     create_before_destroy = true
#   }
# }

# health check
resource "google_compute_health_check" "hc_backserv_trigger" {
  name     = "trigger-hc-backserv"
  check_interval_sec = 30
  healthy_threshold = 2
  unhealthy_threshold = 1
  timeout_sec = 10

  http_health_check {
    port_name = "trigger-app-80"
  }
}

# # MIG
# resource "google_compute_instance_group_manager" "default" {
#   name     = "l7-xlb-mig1"
#   provider = google-beta
#   zone     = "us-central1-c"
#   named_port {
#     name = "http"
#     port = 8080
#   }
#   version {
#     instance_template = google_compute_instance_template.default.id
#     name              = "primary"
#   }
#   base_instance_name = "vm"
#   target_size        = 2
# }

# allow access from health check ranges
# resource "google_compute_firewall" "default" {
#   name          = "l7-xlb-fw-allow-hc"
#   provider = google-beta
#   direction     = "INGRESS"
#   network       = google_compute_network.default.id
#   source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]

#   allow {
#     protocol = "tcp"
#   }
#   target_tags = ["allow-health-check"]
# }


# ---

# Création d'un Load Balancer par module
# network services
# https://registry.terraform.io/modules/GoogleCloudPlatform/lb-http/google/latest
# https://cloud.google.com/load-balancing/docs/https/ext-http-lb-tf-module-examples
# module "lb-http" {
#   source  = "GoogleCloudPlatform/lb-http/google"
#   version = "~>6.2.0"
  
#   name = "trigger-load-balancer"
#   address = google_compute_address.public_ip_trigger.ip
#   backends = {
#       default = {
#           groups = google_compute_target_pool.target_pool_trigger.id
#       }
#   }
    
  
#   security_policy = 
#   url_map = 

#   http_forward = false
# }
