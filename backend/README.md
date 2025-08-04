# PFE Track Backend

Ce projet est le backend de l'application PFE Track, développé avec Spring Boot.

## Prérequis

- Java JDK 17 ou supérieur
- Maven 3.8 ou supérieur

## Configuration

1. Clonez le dépôt
2. Naviguez vers le dossier `backend`

## Exécution

### Avec Maven installé

```bash
mvn spring-boot:run
```

### Sans Maven (avec le wrapper Maven)

Si vous n'avez pas Maven installé, vous pouvez utiliser le wrapper Maven :

1. Téléchargez le wrapper Maven en exécutant :
   ```bash
   mvn -N wrapper:wrapper
   ```

2. Puis exécutez l'application avec :
   ```bash
   ./mvnw spring-boot:run
   ```
   Ou sur Windows :
   ```bash
   mvnw.cmd spring-boot:run
   ```

## Structure du projet

- `src/main/java/com/pfetrack/api` : Code source Java
  - `controller` : Contrôleurs REST
  - `model` : Entités JPA
  - `repository` : Repositories Spring Data
  - `security` : Configuration de sécurité et JWT
  - `service` : Services métier
  - `payload` : DTOs pour les requêtes et réponses

- `src/main/resources` : Ressources
  - `application.properties` : Configuration de l'application

## Base de données

L'application utilise une base de données H2 en mémoire pour le développement.
Console H2 accessible à : http://localhost:8080/api/h2-console

## API Endpoints

### Authentification

- POST `/api/auth/login` : Connexion utilisateur
- POST `/api/auth/register` : Inscription utilisateur

### Utilisateurs

- GET `/api/users` : Liste tous les utilisateurs (Admin uniquement)
- GET `/api/users/{id}` : Récupère un utilisateur par ID
- PUT `/api/users/{id}` : Met à jour un utilisateur
- DELETE `/api/users/{id}` : Supprime un utilisateur (Admin uniquement)

### Test

- GET `/api/test/all` : Contenu public
- GET `/api/test/user` : Contenu utilisateur authentifié
- GET `/api/test/student` : Contenu étudiant
- GET `/api/test/professor` : Contenu professeur
- GET `/api/test/admin` : Contenu administrateur