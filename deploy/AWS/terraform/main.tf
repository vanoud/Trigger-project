# Déploiement du projet TRIGGER sous AWS avec Terraform

# Appel de aws et null
terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~>4.11.0"
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

# Configuration de aws
provider "aws" {
    region = var.region
    access_key = var.access_key_id
    secret_key = var.access_key_secret
}

