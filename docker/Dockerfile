FROM alpine:3.10

ENV NODE_VERSION 13.13.0

ARG nodeUID=1000
ARG nodeGID=1000

RUN addgroup -g ${nodeGID} node \
    && adduser -u ${nodeUID} -G node -s /bin/sh -D node \
    && apk add --no-cache \
        libstdc++ \
    && apk add --no-cache --virtual .build-deps \
        curl \
    && ARCH= && alpineArch="$(apk --print-arch)" \
      && case "${alpineArch##*-}" in \
        x86_64) \
          ARCH='x64' \
          CHECKSUM="f552e1a09f257494cf54cd91c0bd9752993e262edf9dc14fd91dbc13468c980b" \
          ;; \
        *) ;; \
      esac \
  && if [ -n "${CHECKSUM}" ]; then \
    set -eu; \
    curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz"; \
    echo "$CHECKSUM  node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" | sha256sum -c - \
      && tar -xJf "node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
      && ln -s /usr/local/bin/node /usr/local/bin/nodejs; \
  else \
    echo "Building from source" \
    # backup build
    && apk add --no-cache --virtual .build-deps-full \
        binutils-gold \
        g++ \
        gcc \
        gnupg \
        libgcc \
        linux-headers \
        make \
        python \
    # gpg keys listed at https://github.com/nodejs/node#release-keys
    && for key in \
      94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
      FD3A5288F042B6850C66B31F09FE44734EB7990E \
      71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
      DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
      C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
      B9AE9905FFD7803F25714661B63B535A4C206CA9 \
      77984A986EBC2AA786BC0F66B01FBB92821C587A \
      8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
      4ED778F539E3634C779C87C6D7062848A1AB005C \
      A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
      B9E2F5981AA6E0CD28160D9FF13993A75599653C \
    ; do \
      gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
      gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
      gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
    done \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
    && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
    && grep " node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
    && tar -xf "node-v$NODE_VERSION.tar.xz" \
    && cd "node-v$NODE_VERSION" \
    && ./configure \
    && make -j$(getconf _NPROCESSORS_ONLN) V= \
    && make install \
    && apk del .build-deps-full \
    && cd .. \
    && rm -Rf "node-v$NODE_VERSION" \
    && rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt; \
  fi \
  && rm -f "node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" \
  && apk del .build-deps \
  # smoke tests
  && node --version \
  && npm --version

ENV YARN_VERSION 1.22.4

RUN apk add --no-cache --virtual .build-deps-yarn curl gnupg tar \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && apk del .build-deps-yarn \
  # smoke test
  && yarn --version


# Install the packages required for watchman to work properly:
#RUN apk add --no-cache libressl-dev libcrypto1.0 libgcc libstdc++
RUN apk add --no-cache libressl-dev libgcc libstdc++
# Copy the watchman executable binary directly from our image:
COPY --from=icalialabs/watchman:4-alpine3.4 /usr/local/bin/watchman* /usr/local/bin/

# Create the watchman STATEDIR directory:
RUN mkdir -p /usr/local/var/run/watchman \
 && touch /usr/local/var/run/watchman/.not-empty

# (Optional) Copy the compiled watchman documentation:
COPY --from=icalialabs/watchman:4-alpine3.4 /usr/local/share/doc/watchman* /usr/local/share/doc/

RUN apk add git openssh curl python3 make gcc g++ pixman-dev cairo-dev pango-dev jpeg-dev libc6-compat \
  && ln -s /lib64/ld-linux-x86-64.so.2  /lib/ld-linux-x86-64.so.2

COPY --chown=node:node ./ /opt/parabol/

# configuration
ENV TARGET_ENV 'prod'
ENV ATLASSIAN_CLIENT_ID 'key_ATLASSIAN_CLIENT_ID'
ENV ATLASSIAN_CLIENT_SECRET 'key_ATLASSIAN_CLIENT_SECRET'
ENV SERVER_SECRET 'key_SERVER_SECRET'
ENV AWS_ACCESS_KEY_ID 'key_AWS_ACCESS_KEY_ID'
ENV AWS_REGION 'key_AWS_REGION'
ENV AWS_S3_BUCKET 'action-files.parabol.co'
ENV AWS_SECRET_ACCESS_KEY 'key_AWS_SECRET_ACCESS_KEY'
ENV CDN_BASE_URL 'key_CDN_BASE_URL'
ENV DISABLE_CDN_BUILD 'true'
ENV GITHUB_CLIENT_ID 'key_GITHUB_CLIENT_ID'
ENV GITHUB_CLIENT_SECRET 'key_GITHUB_CLIENT_SECRET'
ENV GITHUB_WEBHOOK_SECRET 'key_GITHUB_WEBHOOK_SECRET'
ENV GOOGLE_CLOUD_CLIENT_EMAIL 'key_GOOGLE_CLOUD_CLIENT_EMAIL'
ENV GOOGLE_CLOUD_PRIVATE_KEY 'key_GOOGLE_CLOUD_PRIVATE_KEY'
ENV GOOGLE_CLOUD_PRIVATE_KEY_ID 'key_GOOGLE_CLOUD_PRIVATE_KEY_ID'
ENV GRAPHQL_HOST 'localhost:3000'
ENV GRAPHQL_PROTOCOL 'http'
ENV HOST 'localhost'
ENV ## If commented, will display mails using console.log
ENV #MAILGUN_API_KEY 'key_MAILGUN_API_KEY'
ENV MAILGUN_DOMAIN 'key_MAILGUN_DOMAIN'
ENV MAILGUN_FROM 'key_MAILGUN_FROM'
ENV MIN_LOG_DURATION '200'
ENV PORT '3000'
ENV PROTO 'http'
ENV REDIS_URL 'redis://redis:6379'
ENV RETHINKDB_URL 'rethinkdb://rethinkdb:28015/actionDevelopment'
ENV RETHINKDB_SSL 'false'
ENV # SEGMENT_WRITE_KEY 'key_SEGMENT_WRITE_KEY'
ENV SENTRY_AUTH_TOKEN 'key_SENTRY_AUTH_TOKEN'
ENV # SENTRY_DSN 'key_SENTRY_DSN'
ENV SLACK_CLIENT_ID 'key_SLACK_CLIENT_ID'
ENV SLACK_CLIENT_SECRET 'key_SLACK_CLIENT_SECRET'
ENV STRIPE_SECRET_KEY 'key_STRIPE_SECRET_KEY'
ENV STRIPE_PUBLISHABLE_KEY 'key_STRIPE_PUBLISHABLE_KEY'
ENV ULTRAHOOK_API_KEY 'key_ULTRAHOOK_API_KEY'
ENV STRIPE_WEBHOOK_SECRET 'key_STRIPE_WEBHOOK_SECRET'

USER node

# Create app directory
WORKDIR /opt/parabol

COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]