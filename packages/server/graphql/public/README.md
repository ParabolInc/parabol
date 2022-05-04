## Adding a New Feature

New GraphQL features can be added using the schema definition language (SDL).
All new schema additions should be added in this directory.

### How to add a new mutation (preferred)

1. `yarn newMutation <mutationName> -s <subscriptionChannel> -p`
   This will create all the boilerplate you need.
   If you don't need to publish to a subscription channel, leave off the -s flag.
   `-p` will include postgres files.
   If you use `-p`, writing the SQL and running `pg:build` is up to you
   To learn more, type `yarn newMutation --help`

### How to manually add a new mutation

1. Write a new `.graphql` typeDef
   For mutations, a typeDef typically consists of the following:

- extending the Mutation type with a new field, which is the name of your new mutation
- Adding a new mutation payload, which is the return type of your mutation. _Try to make sure each field is non-null!_.
  - Non-null fields mean the client doesn't have to write fallbacks in case the field comes up null.
  - If 2 nullable fields are mutually exclusive, consider breaking it into 2+ types and returning the union
- For nullable fields, e.g. if the mutation can return an error, make sure the payload is a union type. e.g. `type StartFunPayload = ErrorPayload | StartFunSuccess`

2. Write the mutation resolver
   If you need to write to the DB, add a DB query in [postgres/queries](../../postgres/queries)
   If you need to call a service, use the service Manager (e.g. [AtlassianManager](../../utils/AtlassianServerManager.ts))
   Publish the event to a subscription channel to alert others users who are interested in the event
   Return the smallest possible object you can.
   For example, instead of returning an entire meeting object, return `{meetingId}`.
   This return value is called the `source`.

3. Write the mutation payload resolver
   Typically, a mutation will return an object with primary keys, e.g. `{meetingId, taskId}`, which we call the `source`.
   The mutation payload resolver will transform the `source` into the shape of the mutation payload, e.g. `{meeting, task}`.

4. Define the `source` typescript type, which matches the return value of the mutation.
   Ideally, this type should be put at the top of the mutation payload file.
   By convention, this is the name of the mutation payload + the word "Source".
   For example, a `startFun` mutation would return a `StartFunPayloadSource` which resolves to a `StartFunPayload`.

5. Write permissions
   Add rules to decide who can call the mutation in the [permissions](./permissions.ts)
   You may also decide to validate arguments in the permissions, too.

### How to add a new query

1. Write a new typeDef
   For queries, a typeDef is typically just an extension of the query object
   Some queries may require create a new type, too.

2. Write a resolver
   A query resolver typically includes a call to a dataloader. This keeps our app fast!

3. Write permissions
   Add rules to decide who can call the query in the [permissions](./permissions.ts)
