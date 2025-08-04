# PFE Track - Application de Gestion des PFE et Stages

Cette application permet de gérer les projets de fin d'études (PFE) et les stages. Elle comprend un frontend React et un backend Spring Boot.

## Structure du Projet

- `src/` : Code source du frontend React
- `backend/` : Code source du backend Spring Boot

## Frontend (React + Vite)

### Technologies utilisées

- React
- Vite
- Tailwind CSS
- Framer Motion pour les animations
- React Router pour la navigation
- Axios pour les requêtes HTTP
- JWT pour l'authentification

### Installation et exécution

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

L'application sera accessible à l'adresse http://localhost:5173 ou http://localhost:5174 si le port 5173 est déjà utilisé.

## Backend (Spring Boot)

Voir le [README du backend](./backend/README.md) pour plus d'informations sur l'installation et l'exécution du backend.

### Technologies utilisées

- Spring Boot
- Spring Security
- Spring Data JPA
- JWT pour l'authentification
- Base de données H2 (en mémoire pour le développement)

## Fonctionnalités

- Authentification et autorisation basées sur les rôles (étudiant, professeur, administrateur)
- Gestion des utilisateurs
- Interface utilisateur moderne et responsive
- Animations fluides avec Framer Motion
- Thème sombre avec palette de couleurs noires et dégradés

## Développement

### Frontend

Le frontend est développé avec React et utilise Tailwind CSS pour le style. Les animations sont gérées avec Framer Motion.

### Backend

Le backend est développé avec Spring Boot et utilise Spring Security pour l'authentification et l'autorisation. Les données sont stockées dans une base de données H2 en mémoire pour le développement.
