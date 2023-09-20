FROM postgres:12.15

ADD extensions /extensions

RUN apt-get update && apt-get install -y build-essential

RUN cd /extensions/postgres-json-schema && make install && make installcheck

RUN apt-get install -y --no-install-recommends postgresql-server-dev-12

RUN cd ./extensions/pgvector && ls && make clean && make && make install

COPY extensions/install.sql /docker-entrypoint-initdb.d/
