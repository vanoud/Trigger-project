# Déploiement du projet TRIGGER sous GCP avec Terraform

# Appel de azurerm et null
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

# Configuration de null
provider "null" {}

# Configuration de google
provider "google" {
    project = var.project_id
    region = var.region
    zone = var.zone
}

# Création de la VPC
resource "azurerm_resource_group" "infra_trigger" {
    name = "trigger_infra"
    region = var.region
}

# Création d'une IP publique
resource "azurerm_public_ip" "public_ip_trigger" {
    name = "trigger_public_ip"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    location = azurerm_resource_group.infra_trigger.location
    allocation_method = "Static"
}

# Création d'une règle de pare-feu

# Création d'un modèle d'instance

# Création d'un groupe d'instances

# Création d'un Load Balancer

