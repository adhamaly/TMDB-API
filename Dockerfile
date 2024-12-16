##############
# Build Stage
##############

FROM node:18-bullseye-slim AS build

# RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY --chown=node:node ./package*.json .

# Copy Prisma Migrations
COPY --chown=node:node prisma ./prisma/

# Install node modules (required for "npm run build" to succeed)
RUN npm ci

# Copy the rest of the repository files and folders
COPY --chown=node:node . .

# Generate prisma files >> Build project >> Reinstall node_modules but without dev modules
RUN npm run prisma:generate && npm run build && npm ci --omit=dev

# Use the node user from the image (instead of the root user)
USER node

###################
# Production Stage
###################
FROM node:18-bullseye-slim AS production

# Create app directory
WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
# Prisma folder is needed to apply migrations and seeds
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
# Package.json is needed for the startup command "npm run docker:entrypoint"
COPY --chown=node:node --from=build /usr/src/app/package*.json .
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/.env .

# Bind port 3000
EXPOSE 8080

CMD [ "npm", "run", "docker:entrypoint" ]
