require('dotenv').config()

const pgtypedConfig = {
  "transforms": [
    {
      "mode": "sql",
      "include": "**/*.sql"
    },
    {
      "mode": "ts",
      "include": "**/*.ts",
    }
  ],
  "srcDir": "packages/server/postgres/queries",
  "camelCaseColumnNames": false,
  "db": {
    "dbName": process.env.POSTGRES_DB,
    "user": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "host": process.env.POSTGRES_HOST,
    "port": Number(process.env.POSTGRES_PORT),
  }
}

module.exports = pgtypedConfig
