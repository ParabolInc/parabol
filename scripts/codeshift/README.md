# New Mutation

Creating a new GraphQL Mutation requires the following:

- A client-side mutation
- Adding the mutation to the client-side subscription
- A server-side mutation
- A server-side mutation payload
- Adding the server-side mutation to the rootMutations
- Adding the server-side mutation payload to the subscription

To speed things up, we wrote a script to do this automatically.

```sh
yarn newMutation <<mutationName>> -s <<subscriptionName>>
```

The script above will create all the necessary files.
The `mutationName` is whatever you'd like to call the mutation
The optional `-s` flag is the name of the subscription (e.g. task, team, organization, meeting, etc.).
All you need to do is fill in the business logic.
