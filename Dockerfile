#
# MODULE_CONTRACT: Package the frontend tooling shell for local development.
# SCOPE: Base image, npm install, exposed port, and dev server startup.
# DEPENDS: package.json, vite.config.ts
# LINKS: [FrontendTooling][setup][BLOCK_DEFINE_TOOLCHAIN]
# START_BLOCK_IMAGE
# Container base and dependency installation.
# END_BLOCK_IMAGE
# START_BLOCK_RUNTIME
# Port exposure and Vite dev command.
# END_BLOCK_RUNTIME
FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
