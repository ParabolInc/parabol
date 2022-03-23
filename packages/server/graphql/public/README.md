## Adding a New Feature

New GraphQL features can be added using the schema definition language (SDL).
All new schema additions should be added in this directory.

### How to add a new mutation

1. Write a new typeDef
For mutations, a typeDef typically consists of the following:
- extending the Mutation type with a new field, which is the name of your new mutation
- Adding a new mutation payload, which is the return type of your mutation. _Try to make sure each field is non-null!_
- For nullable fields, e.g. if the mutation can return an error, make sure the payload is a union type. e.g. `type StartFunPayload = StandardError | StartFunSuccess`

2. Write the mutation resolver
If you need to write to the DB, add a DB query in [postgres/quereies](../../postgres/queries)
If you need to call a service, use the service Manager (e.g. [AtlassianManager](../../utils/AtlassianServerManager.ts))
Publish the event to a subscription channel to alert others users who are interested in the event
Return the smallest possible object you can. For example, instead of returning an entire meeting object, return `{meetingId}`

3. Write permissions
Add rules to decide who can call the mutation in the [permissions](./permissions.ts)
You may also decide to validate arguments in the permissions, too.

4. Write the mutation payload source
Create a type with the same shape as the return value of your mutation.
By convention, this is the name of the mutation payload + the word "Source".
For example, a `startFun` mutation would return a `StartFunPayloadSource` which resolves to a `StartFunPayload`.

5. Write the mutation payload resolver
Typically, a mutation will return an object with primary keys, e.g. `{meetingId, taskId}`
In this example, a mutation payload source might have the following fields: `{meetingId, meeting, taskId, task}`
The `meeting, task` fields would pass `meetingId, taskId` to a dataloader to return the full object

### How to add a new query

1. Write a new typeDef
For queries, a typeDef is typically just an extension of the query object
Some queries may require create a new type, too.

2. Write a resolver
A query resolver typically includes a call to a dataloader. This keeps our app fast!

3. Write permissions
Add rules to decide who can call the query in the [permissions](./permissions.ts)
