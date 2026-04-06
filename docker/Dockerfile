FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable
EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --hostname 0.0.0.0 --port 3000"]
