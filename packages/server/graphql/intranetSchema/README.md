## Intranet/Admin interface 

This part of Parabol's API is available only for admins. To become an admin user has to have `su` role set.

`su` role can be set via RethinkDB’s data explorer, on local environment it’s available at: http://localhost:8080/#dataexplorer
To set the `su` role run the following query
```
r.db('actionDevelopment').table('User').filter({email: 'set-your-email-here'}).update({rol:'su'})
```

To set the `su` role in PG open pgAdmin (http://localhost:5050/browser/, credentials are specified in .env as PGADMIN_DEFAULT_EMAIL and PGADMIN_DEFAULT_PASSWORD), configure the server, open the Query Tool and run the following query
```
UPDATE "User" SET "rol" = 'su' WHERE "id" = 'set-your-user-id-here'; 
```

Once the role is set, the admin interface can be accessed locally (logout and login again is required) at http://localhost:3000/admin/graphql and allows you to execute available queries and mutations. 
More info: https://github.com/graphql/graphiql