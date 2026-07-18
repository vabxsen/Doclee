# Cloud Run image for Office <-> PDF conversion via headless LibreOffice.
# Build/deploy manually when ready, e.g.:
#   gcloud run deploy doclee-converter --source services/converter --region us-central1 --allow-unauthenticated
FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice \
      fonts-liberation \
      fonts-dejavu-core \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
