FROM node:latest
# Setup Work directory.
WORKDIR /usr/src/bot
COPY package.json package-lock.json config.json .env  ./

# Let's install everything!
RUN npm ci --only=production

# Copy project to our WORKDIR
COPY . .

# Let's run it!
CMD [ "npm", "run", "prod" ]
