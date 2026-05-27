# Elite Continentale - Backend

API professionnelle avec stockage persistant pour les inscriptions.

## Installation

1. Installer les dépendances :

```bash
npm install
```

2. Initialiser la base de données Prisma :

```bash
npx prisma migrate dev --name init
```

3. Lancer le serveur :

```bash
npm run dev
```

## Configuration

- Par défaut, la base utilise SQLite dans `dev.db`.
- Pour PostgreSQL, définir `DATABASE_URL` dans un fichier `.env`.
- Le token admin par défaut est `ElitePower2024!`, modifiable avec `ADMIN_TOKEN`.

## Endpoints

- `POST /api/register` : enregistrement d'une inscription
- `GET /api/stats` : nombre total d'inscriptions
- `GET /api/registrations` : liste des inscriptions (admin)
- `GET /api/registrations/:id/pdf` : récupération du PDF (admin)
- `DELETE /api/registrations/:id` : suppression d'une inscription (admin)
