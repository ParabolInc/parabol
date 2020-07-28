FROM node:13.6.0 as base

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN mkdir -p /parabol/node_modules && mkdir -p /home/node/.npm-global

WORKDIR /parabol/
ADD package.json .
ADD yarn.lock .
COPY . .

FROM base as dev
RUN cp docker/entrypoint.dev.sh /bin/entrypoint
RUN chmod +x /bin/entrypoint
EXPOSE 3000
ENTRYPOINT [ "entrypoint" ]

CMD ["yarn", "dev", "-i"]

FROM base as prod
RUN cp docker/entrypoint.prod.sh /bin/entrypoint
RUN chmod +x /bin/entrypoint
EXPOSE 80
ENTRYPOINT [ "entrypoint" ]
CMD ["yarn", "start"]