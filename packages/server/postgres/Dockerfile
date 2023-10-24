FROM postgres:15.4

ADD extensions /extensions

RUN apt-get update && apt-get install -y build-essential locales

RUN cd /extensions/postgres-json-schema && make install && make installcheck

RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

COPY extensions/install.sql /docker-entrypoint-initdb.d/
