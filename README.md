# Electro Elhabchi

Plateforme e-commerce MERN en français pour la vente de matériel électronique. Le dépôt contient une application React/Vite et une API Node/Express avec MongoDB/Mongoose.

## Prérequis

- Node.js 20 ou plus récent et npm.
- MongoDB accessible via une URI configurée dans `server/.env`.
- Pour que création de commande et mise à jour du stock soient atomiques, MongoDB doit fonctionner en replica set (MongoDB Atlas le configure automatiquement).

## Démarrage

```powershell
npm install
Copy-Item .env.example server/.env
```

Remplacez `JWT_SECRET` par une valeur aléatoire longue, puis démarrez MongoDB et lancez depuis la racine :

```powershell
npm run dev
```

Le client est servi sur <http://localhost:5173> et l’API sur <http://localhost:5000/api/v1>. `npm run build` compile le client et `npm start` démarre l’API.

Pour remplir la boutique avec des catégories et quelques références de démonstration :

```powershell
npm run seed -w server
```

Les inscriptions publiques créent toujours des comptes client. Le rôle n’est jamais accepté depuis le formulaire.

## API principale

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public, limité en débit |
| POST | `/api/v1/auth/logout` | Public |
| GET | `/api/v1/auth/me` | Connecté |
| GET | `/api/v1/products?q=&category=&brand=&minPrice=&maxPrice=&page=&limit=` | Public |
| GET | `/api/v1/products/:id` | Public |
| POST / PATCH / DELETE | `/api/v1/products[/:id]` | Administrateur |
| GET | `/api/v1/categories` | Public |
| POST | `/api/v1/orders` | Client connecté |
| GET | `/api/v1/orders/me` | Client connecté |
| GET | `/api/v1/orders` | Administrateur |
| PATCH | `/api/v1/orders/:id/status` | Administrateur |

## Structure

```text
client/src/
  app/          Redux store, routes et état global
  components/   Navigation et composants réutilisables
  features/     API et logique du catalogue, compte et panier
  pages/        Catalogue, compte, panier et administration
server/src/
  config/       Configuration MongoDB
  controllers/  Traitement HTTP
  middleware/   Authentification, validation et erreurs
  models/       Modèles Mongoose
  routes/       Routes versionnées
```

## Sécurité et limites

- JWT court en cookie `HttpOnly`, `SameSite=Lax`, et `Secure` en production ; aucun jeton dans `localStorage`.
- Validation Joi, limitation de débit à la connexion, contrôle de rôle côté API, réponses d’erreur sans pile en production.
- Le serveur recalcule les prix et les totaux à partir du catalogue. Le stock est réservé dans une transaction MongoDB.
- Le paiement est au comptant à la livraison. Aucun paiement par carte n’est simulé ou collecté.
- Configurez `CLIENT_ORIGIN` avec l’origine exacte du frontend en production, HTTPS, sauvegardes MongoDB, journalisation et surveillance avant mise en ligne.
