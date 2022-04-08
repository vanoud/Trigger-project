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
	```az login```
	2. Noter le champ id qui est donné à la validation de la connexion.
	3. Définir l'abonnement actif  en utilisant le champ "id" communiqué :
    ```az account set --subscription "<id>"```
4. Créer un fichier terraform.tfvars.
5. Compléter ce fichier en se basant sur les variables définies dans le fichier variables.tf joint.
6. Dans l'invite de commande :
	1. Initialiser le projet :
	```terraform init```
	2. Lancer le déploiement :
	```terraform apply```
	3. Répondre à la question posée avec "yes"

## Supprimer le déploiement
Dans le répertoire de travail, saisir en invite de commande :
```terraform destroy```
