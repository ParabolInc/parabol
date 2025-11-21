## README

Each file in this directory is a helper function that calls a generated query.
The helper functions are useful because they make code easier to manage:

- Add stricter types that PGtyped fails to generate
- Only take query params, they get the client pool themselves
- Return the first object when the query is guaranteed to only return 1 row
