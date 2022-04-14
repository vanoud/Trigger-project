# Déploiement du projet TRIGGER sous Azure avec Terraform

# Appel de azurerm et null
terraform {
    required_providers {
        trigger = {
            source = "hashicorp/azurerm"
            version = "~>2.99.0"
        }
        null = {
            source = "hashicorp/null"
            version = "~>3.1.1"
        }
    }
}

# Configuration de null
provider "null" {}

# Configuration de azurerm
provider "trigger" {
    features {
        resource_group {
            prevent_deletion_if_contains_resources = false
        }
        virtual_machine {
            delete_os_disk_on_deletion = true
        }
    }
    subscription_id = var.subscription_id
    tenant_id = var.tenant_id
}

# Création du groupe de ressource Azure
resource "azurerm_resource_group" "infra_trigger" {
    name = "trigger_infra"
    location = var.ressource_loc
}

# Réseau

# Création du groupe de sécurité réseau
resource "azurerm_network_security_group" "netsecgrp_trigger" {
    name = "trigger_netsecgrp"
    location = azurerm_resource_group.infra_trigger.location
    resource_group_name = azurerm_resource_group.infra_trigger.name
}

# Création d'une règle de sécurité pour SSH
resource "azurerm_network_security_rule" "secrulessh_trigger" {
    name = "SSH_22"
    protocol = "Tcp"
    source_port_range = "*"
    destination_port_range = "22"
    source_address_prefix = "*"
    destination_address_prefixes = azurerm_virtual_network.vnet1_trigger.address_space
    access = "Allow"
    priority = 300
    direction = "Inbound"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    network_security_group_name = azurerm_network_security_group.netsecgrp_trigger.name
}

# Création d'une règle de sécurité pour l'application (flask)
resource "azurerm_network_security_rule" "secruleflask_trigger" {
    name = "flask_5000"
    protocol = "Tcp"
    source_port_range = "*"
    destination_port_range = "5000"
    source_address_prefix = "*"
    destination_address_prefixes = azurerm_virtual_network.vnet1_trigger.address_space
    access = "Allow"
    priority = 200
    direction = "Inbound"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    network_security_group_name = azurerm_network_security_group.netsecgrp_trigger.name
}

# Création d'un réseau virtuel trigger_vnet1
resource "azurerm_virtual_network" "vnet1_trigger" {
    name = "trigger_vnet1"
    address_space = ["10.0.0.0/16"]
    location = azurerm_resource_group.infra_trigger.location
    resource_group_name =azurerm_resource_group.infra_trigger.name
}

# Création d'un sous-réseau trigger_subnet1 contenu dans le réseau virtuel trigger_vnet1
resource "azurerm_subnet" "subnet1_trigger" {
    name = "trigger_subnet1"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    virtual_network_name = azurerm_virtual_network.vnet1_trigger.name
    address_prefixes = ["10.0.1.0/24"]
}

# Création d'une IP publique
resource "azurerm_public_ip" "public_ip_trigger" {
    name = "trigger_public_ip"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    location = azurerm_resource_group.infra_trigger.location
    allocation_method = "Dynamic"
}

# Liaison du groupe de sécurité netsecgrp_trigger avec le sous-réseau subnet1_trigger
resource "azurerm_subnet_network_security_group_association" "netsecgroupasso_trigger" {
    network_security_group_id = azurerm_subnet.subnet1_trigger.id
    subnet_id = azurerm_network_security_group.netsecgrp_trigger.id
}

# /Réseau

# Machine virtuelle

# Interface réseau VM
resource "azurerm_network_interface" "nic1_trigger" {
    name = "trigger_nic1"
    location = azurerm_resource_group.infra_trigger.location
    resource_group_name = azurerm_resource_group.infra_trigger.name
    enable_accelerated_networking = true
    #internal_dns_name_label = "trigger_nic1"
    ip_configuration {
      name = "nic1"
      private_ip_address_allocation = "Dynamic"
      #public_ip_address_id = azurerm_public_ip.public_ip_trigger.id
      #gateway_load_balancer_frontend_ip_configuration_id = 
      subnet_id = azurerm_subnet.subnet1_trigger.id
    }
}

resource "azurerm_linux_virtual_machine" "vm1_trigger" {
    name                = "trigger-vm1"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    location            = azurerm_resource_group.infra_trigger.location
    size                = var.vm_size
    admin_username      = var.username_trigger
    network_interface_ids = [
        azurerm_network_interface.nic1_trigger.id,
    ]

    admin_ssh_key {
        username   = var.username_trigger
        public_key = azurerm_ssh_public_key.sshpubkey_trigger.public_key
    }

    os_disk {
        caching              = "ReadWrite"
        storage_account_type = var.vm_disk_type
    }

    # You can list available LTS images from Canonical with the command 'az vm image list --all --publisher Canonical --sku lts'
    source_image_reference {
        publisher = "Canonical"
        offer     = "0001-com-ubuntu-server-focal"
        sku       = "20_04-lts-gen2"
        version   = "latest"
    }
}

resource "azurerm_ssh_public_key" "sshpubkey_trigger" {
    name = "trigger_sshpubkey"
    resource_group_name = azurerm_resource_group.infra_trigger.name
    location            = azurerm_resource_group.infra_trigger.location
    public_key          = file(var.sshpubkey_trigger)
}

resource "null_resource" "bringup_trigger" {
    depends_on = [azurerm_linux_virtual_machine.vm1_trigger,azurerm_ssh_public_key.sshpubkey_trigger]
    provisioner "remote-exec" {
        connection {
          type = "ssh"
          user = "var.username_trigger"
          host = "data.azurerm_network_interface.nic1_trigger.private_ip_address"
          port = "22"
          timeout = "1m"
          private_key = var.sshprivatekey_trigger
          #private_key = file(var.sshprivatekey_trigger)
        }
        inline = [
            "- 1/5. Màj et installation Git.",
            "cd ~",
            "sudo apt update && sudo apt upgrade -y && sudo apt install git -y",
            "- 2/5. Cloner le dépôt.",
            "git clone https://github.com/vanoud/Trigger-project.git",
            "- 3/5. Créer et activer l'environnement virtuel.",
            "cd Trigger-project/",
            "py -3 -m venv venv",
            "venv/Scripts/activate",
            "- 4/5. Installer flask et dépendances.",
            "pip install -r requirements.txt",
            "- 5/5. Lancer le projet sous flask.",
            "flask run"
        ]
    }
}
