FROM postgres:15.7
ARG PGVECTOR_VERSION=v0.7.0
ARG PSQL_MAJOR_VERSION=15

COPY extensions /extensions

RUN apt-get update && apt-get install -y \
    build-essential \
    locales \
    postgresql-server-dev-${PSQL_MAJOR_VERSION} \
    git

# PGVector
RUN git clone --branch ${PGVECTOR_VERSION} \
       https://github.com/pgvector/pgvector.git /extensions/pgvector && \
       cd extensions/pgvector && make clean && make && make install

RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

COPY extensions/install.sql /docker-entrypoint-initdb.d/
