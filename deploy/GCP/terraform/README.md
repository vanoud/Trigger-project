# Déployer Trigger sous GCP avec Terraform

## Pré-requis
* Terraform installé et opérationnel.
* Utilisateur GCP créé et opérationnel (dont la facturation).
* GCP CLI installé et configuré sur la machine d'où la terraformation sera initiée.
* Clefs SSH générées pour la VM.

## Déploiement
1. Dans la console web GCP :
   1. Depuis la section IAM & Admin > Manage Ressources, créer un projet. Noter son "Project ID".
   2. Depuis la section IAM & Admin > IAM, s'assurer que l'utilisateur a bien les permission nécessaires, qui sont ici :
      * compute.instance.*
      * compute.firewall.*
   3. Depuis la section "Compute Engine", activer l'API Compute Engine
2. Récupérer et dézipper le répertoire GCP/terraform du projet.
3. La suite du processus se passera dans le répertoire dézippé.
4. Dans l'invite de commande :
	1. Se connecter avec l'[ADC pour pouvoir appeler les API Google](https://cloud.google.com/sdk/gcloud/reference/auth/application-default). Une fenêtre de navigateur s'ouvrira après avoir saisi la commande suivante :
	```
	gcloud auth application-default login
	```
	2. Choisir le compte adéquat dans la fenêtre qui s'ouvre sur le navigateur web.
	3. L'interface de ligne de commande va donner le chemin du fichier contenant toutes les données essentielles de cet enregistrement.
5. Créer et compléter un fichier "terraform.tfvars" en se basant sur le modèle "terraform.tfvars.default" fourni. Le fichier "variables.tf" ne doit pas être modifié.
6. Dans l'invite de commande :
	4. Initialiser le projet :
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
