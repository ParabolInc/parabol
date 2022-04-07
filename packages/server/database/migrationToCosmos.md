### Possible Solutions
Export with rethinkdb dump command and then utilize mongoimport to import into MongoDB
```rethinkdb dump -e dbname.tableName```

Generating a tar file:
```rethinkdb_dump_<datetime>.tar.gz```

After unzipping the tar file, leverage the mongoimport script below:
```mongoimport --jsonArray --db dbName --collection tableName ./rethinkdb_dump_<datetime>/dbName/tableName.json```


The indexes for RethinkDB and MongoDB are quite different.  From the RethinkDB website:

MongoDB supports unique, compound, secondary, sparse, and geospatial indexes. All MongoDB indexes use a B-tree data structure. Every MongoDB query, including update operations, uses one and only one index.

RethinkDB supports primary key, compound, secondary, geospatial, and arbitrarily computed indexes stored as B-trees. Every RethinkDB query, including update operations, uses one and only one index.

Unfortunately for the indexes, the format between RethinkDB and MongoDB is quite different. The indexes are stored within the same archived file:

```./rethinkdb_dump_<datetime>/dbName/tableName.info```
