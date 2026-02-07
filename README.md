# Chocolate - Minuteur d'entraînement

Application PWA de minuterie d'entraînement. Configurez vos exercices, lancez le chrono et laissez l'app guider votre session.

## Fonctionnalités

- Création d'étapes personnalisées (exercice, repos) avec durée et/ou répétitions
- Gestion de cycles multiples
- Profils sauvegardables pour vos différents programmes
- Son de fin d'étape (activable/désactivable)
- Fonctionne hors-ligne (PWA)
- Écran toujours allumé pendant l'entraînement (Wake Lock)

## Stack technique

- [Next.js](https://nextjs.org/) 14
- [React](https://react.dev/) 18
- [Tailwind CSS](https://tailwindcss.com/) 3
- [next-pwa](https://github.com/shadowwalker/next-pwa) pour le service worker
- Déployé sur [Netlify](https://www.netlify.com/)

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
