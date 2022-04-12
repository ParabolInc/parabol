### 
There are often comparisons between RethinkDB and MongoDB as they are both json / document type databases.  They are built on different architectures and while they are some similarities on the surfaces, they do have enough differences and perhaps some of these differences may prove an opportunity to migrate from one system to another in the future should a database feature become necessary down the road that is available in one platform over the other.
(1) Cloud Availability: MongoDB is available on all cloud platforms, while RethinkDB is available on AWS, dotCloud, and Compose.io
(2) Data Modeling: Since MongoDB uses an extension of JSON called BSON, it can support additional data types related to time that are not available in JSON.  RethinkDB only supports JSON structure.

To learn more about the comparisons, there is an unbiased technical comparison between the two document-based databases:
https://rethinkdb.com/docs/comparison-tables/


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
