FROM node:22-alpine AS verified
WORKDIR /app
COPY index.html styles.css story.css process.css script.js visuals.js story.js motion.js favicon.svg server.mjs ./
COPY assets ./assets
COPY test ./test
RUN node --test test/*.test.mjs

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=verified /app/index.html /app/styles.css /app/story.css /app/process.css /app/script.js /app/visuals.js /app/story.js /app/motion.js /app/favicon.svg /app/server.mjs ./
COPY --from=verified /app/assets ./assets
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
