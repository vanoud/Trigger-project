# Déployer Trigger sous GCP avec Terraform

## Pré-requis
* Terraform installé et opérationnel.
* Utilisateur GCP créé et opérationnel (dont la facturation).
* GCP CLI installé sur la machine.
* Clefs SSH générées pour la VM.

## Déploiement
1. Dans la console web GCP :
   1. Depuis la section IAM & Admin (> Manage Ressources), créer un projet. Noter son "Project ID".
   2. Depuis la section "Compute Engine", activer l'API Compute Engine
2. Récupérer et dézipper le répertoire GCP/terraform du projet.
3. La suite du processus se passera dans le répertoire dézippé.
4. Dans l'invite de commande :
	1. Se connecter avec GCP CLI :
	```
	gcloud init
	```
	!!! La commande suivante est à envisager en remplacement de la précédente : gcloud auth application-default login
	https://cloud.google.com/sdk/gcloud/reference/auth/application-default
	https://cloud.google.com/docs/terraform/get-started-with-terraform
	2. Choisir le compte adéquat, puis l'ID du projet notée précédemment.
5. Créer et compléter un fichier "terraform.tfvars" en se basant sur le modèle "terraform.tfvars.default" fourni. Le fichier "variables.tf" ne doit pas être modifié.
6. Dans l'invite de commande :
	1. Initialiser le projet :
	```
	terraform init
	```
	2. Prévisualiser et vérifier les changements qui seront effectués :
	```
	terraform plan
	```
	3. Lancer le déploiement :
	```
	terraform apply
	```
	4. Répondre à la question posée par "yes"

## Supprimer le déploiement
Dans le répertoire de travail, saisir en invite de commande :
```
terraform destroy
```
