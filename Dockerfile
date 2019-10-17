FROM alpine:latest
# Setup Work directory.
WORKDIR /usr/src/bot
COPY package.json package-lock.json config.json .env  ./

# Let's install everything!
RUN apk add --update \
    && apk add nodejs-current nodejs-npm \
    && apk add --virtual .build git curl build-base g++ \
    && npm install -s \
    && apk del .build

# Copy project to our WORKDIR
COPY . .

# Let's run it!
CMD [ "npm", "run", "prod" ]
