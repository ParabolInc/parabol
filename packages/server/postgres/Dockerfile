FROM postgres:13.1
ENV POSTGRES_PASSWORD password
COPY init.sql /docker-entrypoint-initdb.d/
COPY postgres.conf /usr/local/etc/postgres/postgres.conf
