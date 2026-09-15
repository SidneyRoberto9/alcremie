# syntax=docker/dockerfile:1

# glibc (not alpine): onnxruntime-node only ships glibc prebuilds.
ARG NODE_IMAGE=node:24-bookworm-slim

# models/ is gitignored (362MB), so the clone Coolify builds from has no weights.
# Fetching them in their own stage keeps the layer cached across builds: it only
# invalidates when fetch-model.sh changes, not on every source edit.
FROM curlimages/curl:8.21.0 AS model
USER root
WORKDIR /m
COPY scripts/fetch-model.sh .
RUN sh fetch-model.sh

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Inlined into the client bundle, so it has to exist at build time.
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD=alcremie
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD=${NEXT_PUBLIC_CLOUDINARY_CLOUD}
# The home page prerenders from the database (revalidate = 60), so the build
# needs a reachable DATABASE_URL. Coolify passes it as a build arg when the
# variable is flagged "Build Variable". It never reaches the final image: this
# stage is discarded and only .next/standalone is copied forward.
ARG DATABASE_URL
# Via ENV, never expanded inside a RUN: BuildKit echoes the expanded command
# line, so `RUN ... "$DATABASE_URL"` would print the password into the build log.
ENV DATABASE_URL=${DATABASE_URL}
RUN printenv DATABASE_URL > /dev/null || { echo "DATABASE_URL build arg is required (flag it as a Build Variable in Coolify)"; exit 1; }
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# The ONNX tagger reads these from process.cwd() at upload time.
COPY --from=model --chown=node:node /m/models ./models
USER node
EXPOSE 3000
# /api/stats is ISR-cached (revalidate = 60), so polling it is nearly free,
# and it still fails when the database is gone.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/stats').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
