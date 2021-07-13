#!/bin/bash

dbName=$1
metaCommand=$2

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $dbName -c "$metaCommand"
