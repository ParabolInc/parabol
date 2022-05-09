### Opportunities for switching from RethinkDB to Postgres
Performing searches with RethinkDB can prove to show some limitations as the searches would need to be pre-computed.
Potentially moving to an open-source database such as Postgres allows for the ability to computer searches on the fly.
Most DBAs prefer to compute statistics on demand. Computing statistics on the fly for RethinkDB will cause poor performance.  On the other hand, implementing statistics as SQL queries in Postgres shows much better performance even when iplementing statistics from more than one table.

Additionally, [RethinkDB is no longer commercially supported](https://rethinkdb.com/blog/rethinkdb-shutdown/), while PostgreSQL has been one of the most frequently deployed relational database management systemsa and [in a recent Stack Overflow annual Developer Survey of nearly 90,000 developers, PostgreSQL is the second most used database technology behind MySQL.](https://insights.stackoverflow.com/survey/2019/?utm_source=thenewstack&utm_medium=website&utm_campaign=platform#technology-_-databases)

#### Migrating to Postgres through Haskell

The following documentation shows how [Haskell web services](https://medium.com/fuzzy-sharp/migrating-to-postgres-2dc1519a6dc7) is used to migrate from RethinkDB to Postgres using open source methodologies only

#### Why PostgreSQL on Azure
(1) Integration with Azure data ecosystem with PowerBI, AzureML, Azure Cognitive Services, Azure SQLDB, and Azure CosmosDB
(2) Fully managed, Highly Scalable, Flexibile deployment options including Hybrid, and 100% Open source with Flexible Server

#### Flexible server is architected to meet requirements for modern apps
The Flexible Server deployment option for Postgres is hosted on the same platform as Azure Database for PostgreSQL - Hyperscale (Citus). Flexible Server is hosted in a single-tenant Virtual Machine (VM) on Azure, on a Linux based operating system that aligns naturally with the Postgres engine architecture.

Your Postgres applications and clients can connect directly to Flexible Server, eliminating the need for redirection through a gateway. The direct connection also eliminates the need to include @servername suffix in your username on Flexible Server. Additionally, you can now place Flexible Server’s compute and storage—as well as your application—in the same Azure Availability Zone, resulting in lower latency to run your workloads.

For storage, the Flexible Server option for Postgres uses Azure Premium Managed Disk. In the future, we will provide an option to use Azure Ultra SSD Managed Disk. The database and WAL archive (WAL stands for write ahead log) are stored in zone redundant storage.

#### Major features available on Flexible Server Postgres
(1) Availability & Connectivity: Zone-redundant high availability with automatic zero data loss failovers, on-demand failover, co-locate with apps in teh same availability zone, PgBouncer--connection pooler, and Geo-Backup and restore for Disaster Recovery
(2) Security: Public and Private (VNET) using VNET injection, SSL Enabled by default TLS 1.2 encryption, SCRAM authentication, and Private DNS Zone support
(3) Control / Monitoring: Schedule your maintenance window, More server parameters, On-demand scale compute/storage, and Resource health
(4) SKUs & Developer Experience: stop/start feature, simplification (Portal/CLI/ARM/API/Terraform), Burstable SKUs, and easily create with smart default SKUs.

[Read More....](https://techcommunity.microsoft.com/t5/azure-database-for-postgresql/what-is-flexible-server-in-azure-database-for-postgresql/ba-p/1741346)

[Quickstart: Create an Azure Database for PostgreSQL - Flexible Server in the Azure portal](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal)

[Quickstart: Create an Azure Database for PostgreSQL Flexible Server using Azure CLI](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-cli)

[Quickstart: Use an ARM template to create an Azure Database for PostgreSQL - Flexible Server](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-arm-template?tabs=portal%2Cazure-portal)
