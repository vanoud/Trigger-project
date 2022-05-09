variable "subscription_id" {
    description = "Fourni par Azure sous le nom 'id' ou 'Subscription ID'"
    type = string
}
variable "tenant_id" {
        description = "Fourni par Azure sous le nom 'homeTenantId' ou 'Parent management group'"
    type = string
}
variable "ressource_loc" {
        description = "Domiciliation géographique du déploiement, à choisir sur Azure"
    type = string
}
variable "vm_size" {
        description = "SKU/taille de la VM, à choisir sur Azure"
    type = number
}
variable "vm_disk_type" {
        description = "SKU/type de stockage pour l'IS de la VM, à choisir sur Azure"
    type = string
}
variable "username_trigger" {
        description = "Nom d'utilisateur pour la VM, à choisir"
    type = string
}
variable "sshpubkey_trigger" {
        description = "Chemin d'accès du fichier clef public SSH à importer sur la VM, clef RSA uniquement"
    type = string
}
variable "sshprivatekey_trigger" {
        description = "Chemin d'accès du fichier clef privé SSH pour accéder à la VM, clef RSA uniquement"
    type = string
}
