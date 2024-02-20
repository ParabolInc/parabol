FROM postgres:15

ADD extensions /extensions

RUN apt-get update && apt-get install -y \
    build-essential \
    locales \
    postgresql-server-dev-15 \
    git

RUN cd /extensions/postgres-json-schema && make install && make installcheck
RUN git clone --branch v0.5.0 \
       https://github.com/pgvector/pgvector.git /extensions/pgvector && \
       cd extensions/pgvector && make clean && make && make install

RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

COPY extensions/install.sql /docker-entrypoint-initdb.d/
