FROM postgres:12.15

ADD extensions /extensions

RUN apt-get update && apt-get install -y --no-install-recommends build-essential postgresql-server-dev-12 git-all

RUN cd /extensions/postgres-json-schema && make install && make installcheck

RUN git clone --branch v0.5.0 https://github.com/pgvector/pgvector.git extensions/pgvector && cd extensions/pgvector && make clean && make && make install

COPY extensions/install.sql /docker-entrypoint-initdb.d/
