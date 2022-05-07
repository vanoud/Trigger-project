# Déployer Trigger avec Kubernetes

## Pré-requis
* Kubernetes installé et opérationnel
* Minikube installé et opérationnel
* Accés au dockerhub où l'image du projet est stockée
* Avoir ssh.exe dans les variables d'environnement
## Déploiement

1. Pour lancer un cluster local kubernetes, utilisez la commande :
   ```
   minikube start
   ```

2. Afin d'appliquer les fichiers de configuration, uuvrir un nouveau terminal et lancez :
   
	```
	kubectl apply -f .\deploy\kubernetes\trigger-deployment.yml
	```

3. Pour créer une route vers le service, lancer la commande :
   ```
   minikube tunnel
   ```
   Ne pas fermer le terminal du tunnel.


4. Le deploiement et le service ont été crées, utilisez la commande :

   ```
   minikube dashboard
   ```


   Afin d'avoir un visuel sur le déploiement.

1. Dans l'onglet 'services', cliquez sur l'adresse de terminaison externe pour avoir accés au projet déployer.

## Supprimer le déploiement

Pour supprimer le déploiement : 

```
kubectl delete deployment <nom-service>
```

Pour supprimer le service : 

```
kubectl delete service <nom-déploiement>
```

Pour supprimer le cluster local : 

```
minikube delete
```