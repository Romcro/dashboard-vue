# Canopée · tableau de bord de santé des forêts

Prototype de tableau de bord pour suivre l'état sanitaire de massifs forestiers : alertes de dépérissement détectées par satellite, surfaces touchées, essences, carte des parcelles.

**Démo en ligne :** [romcro.github.io/Romcro/demo-foret](https://romcro.github.io/Romcro/demo-foret/), sur des données entièrement fictives.

## Fonctionnalités

- **Vue d'ensemble** : alertes détectées, surface impactée, forte sévérité et parcelles touchées, comparées à la période précédente.
- **Graphiques** (Chart.js) : dépérissements par mois, surface affectée, répartition par sévérité et par essence, forêts les plus touchées.
- **Carte** (MapLibre GL, fond satellite) : parcelles et alertes, filtres par parcelle, sévérité, statut et surface, vue 2D ou 3D.
- **Météo** de la période via l'API Open-Meteo.
- **Interface** : trois modes de navigation (menu flottant, latéral complet ou compact), thème clair et sombre, préférences mémorisées.
- **Authentification** Firebase quand l'application est reliée à une API réelle.

## Mode démo

Sans configuration Firebase, l'application démarre en mode démo : pas d'écran de connexion, et des données générées localement (`src/demo/demoData.js`) remplacent l'API : quatre forêts imaginaires du Grand Est, leurs parcelles et deux ans d'alertes datées par rapport au jour de la visite.

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # version statique dans dist/
```

Pour brancher une API réelle, copier `.env.example` en `.env` et renseigner l'URL de l'API et la configuration Firebase.

## Technique

Vue 3 (`<script setup>`), Vue Router, Vite, Chart.js, MapLibre GL, date-fns, Firebase Auth.
