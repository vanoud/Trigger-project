# Déployer Trigger sous Azure avec Terraform

## Pré-requis
* Terraform installé et opérationnel
* Compte Azure avec subscription_id et tenant_id
* Azure CLI installé
* Clefs SSH générées pour la VM

## Déploiement
1. Récupérer et dézipper le répertoire.
2. La suite du processus se passera dans le répertoire dézippé.
3. Dans l'invite de commande :
	1. Se connecter avec Azure :
	```
	az login
	```
	2. Noter le champ "id" qui est donné à la validation de la connexion.
	3. Définir l'abonnement actif en utilisant le champ "id" communiqué :
    ```
	az account set --subscription "<id>"
	```
4. Créer et compléter un fichier "terraform.tfvars" en se basant sur le modèle "terraform.tfvars.default" fourni. Le fichier "variables.tf" ne doit pas être modifié.
	* Il est possible d'explorer les disponibilités des ressources VM et Disque par localisation géographique avec la commande Azure CLI suivante :
	```
	az vm list-skus --location <nom-localisation> --zone --all --output table
	```
5. Dans l'invite de commande :
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
