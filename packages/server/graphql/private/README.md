## Private Schema/Admin interface

This part of Parabol's API is available only for admins. To become an admin user has to have `su` role set.

To set the `su` role in PG open pgAdmin (http://localhost:5050/browser/, credentials are specified in .env as PGADMIN_DEFAULT_EMAIL and PGADMIN_DEFAULT_PASSWORD), configure the server, open the Query Tool and run the following query
```
UPDATE "User" SET "rol" = 'su' WHERE "id" = 'set-your-user-id-here';
```

Once the role is set, the admin interface can be accessed locally (logout and login again is required) at http://localhost:3000/admin/graphql and allows you to execute available queries and mutations.
More info: https://github.com/graphql/graphiql

### Directory Hierarchy

We've moved to an SDL-based GraphQL structure instead of code-first.
That means we write the schema in .graphql files and run it through code that creates an executable schema.
The old way was to create objects in typescript & generate a .graphql from those assembled objects.
Writing new features should be faster, require less code, and have strong typings.
