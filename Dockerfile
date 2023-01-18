FROM node:lts AS builder

# Installs latest Chromium package.
RUN apt-get -qy update && apt-get -qy install openssl \
      chromium \
      ca-certificates \
      g++ \
      make \
      libssl-dev
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:lts

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# 👇 copy prisma directory
COPY --from=builder /app/prisma ./prisma

# 👇 new migrate and start app script
CMD [  "npm", "run", "start:migrate:prod" ]