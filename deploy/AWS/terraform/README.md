# Déployer Trigger sous AWS avec Terraform

## Pré-requis
* Terraform installé et opérationnel
* Utilisateur AWS disposant d'une clef d'accès et des permissions suivantes [A LISTER !]
* AWS CLI installé sur la machine
* Clefs SSH générées pour la VM

## Déploiement
1. Récupérer et dézipper le répertoire.
2. La suite du processus se passera dans le répertoire dézippé.
3. Dans l'invite de commande :
	1. Se connecter avec AWS CLI :
	```
	aws configure
	```
	2. Saisir l'ID de la clef d'accès, puis le secret de la clef d'accès.
	3. Choisir la région par défaut, et le mode d'affichage des données préféré (table, json...).
4. Créer et compléter un fichier "terraform.tfvars" en se basant sur le modèle "terraform.tfvars.default" fourni. Le fichier "variables.tf" ne doit pas être modifié.
5. Dans l'invite de commande :
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
