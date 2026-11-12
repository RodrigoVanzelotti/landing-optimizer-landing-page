FROM node:22-alpine AS verified
WORKDIR /app
COPY index.html em-breve.html styles.css story.css process.css optimizer.js script.js visuals.js story.js motion.js favicon.svg server.mjs ./
COPY assets ./assets
COPY robots.txt sitemap.xml ./
COPY test ./test
RUN node --test test/*.test.mjs

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=verified /app/index.html /app/em-breve.html /app/styles.css /app/story.css /app/process.css /app/optimizer.js /app/script.js /app/visuals.js /app/story.js /app/motion.js /app/favicon.svg /app/server.mjs ./
COPY --from=verified /app/assets ./assets
COPY --from=verified /app/robots.txt /app/sitemap.xml ./
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
