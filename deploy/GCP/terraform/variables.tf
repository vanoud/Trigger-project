variable "project_id" {
    description = "ID du projet créé depuis la console GCP."
    type = string
#    default = "trigger-chat"
}
variable "project_region" {
    description = "Région où se trouvent tous les éléments du projet."
    type = string
}
variable "project_zone" {
    description = "Zone où se trouvent tous les éléments du projet, doit être contenu dans la région choisie."
    type = string
}
variable "vm_type" {
    description = "SKU/taille de la VM, à choisir sur GCP."
    type = string
}
