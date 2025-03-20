# Utiliser l'image Node.js officielle
FROM node:20.17-slim
RUN apt-get update && apt-get install -y procps

# Créer un dossier de travail
WORKDIR /home/node/app/api

# Copier le package.json et package-lock.json
COPY ./api/package*.json ./

# Installer les dépendances
RUN npm install --ignore-scripts

# Copier le reste du code
COPY ./api .

# Exposer le port (par exemple 3000)
EXPOSE 3000

ENV TZ=Europe/Paris

# Commande pour démarrer l'application
CMD ["npm", "start"]
