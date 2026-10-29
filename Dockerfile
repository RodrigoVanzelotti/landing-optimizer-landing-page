FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY index.html styles.css story.css script.js visuals.js story.js motion.js favicon.svg server.mjs ./
COPY assets ./assets
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
