import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'

const scopes = Object.values(OAuthScopeEnum).join(', ')

const mcpInstructions = `Parabol is where teams run meetings (retrospectives, standups, sprint poker, check-ins), track tasks and write pages. Start with get_me to see who you are and the teams you can reach.

IDs are opaque. Pass back exactly the id you received; never build, parse or change one.

Each area needs its own scope. The scopes are ${scopes}. A :read scope lets you look and a :write scope lets you change. A call that needs a scope this connection lacks fails with FORBIDDEN.

A connection may be limited to some organizations, teams or pages. Anything outside them is out of reach, and the error says so when you ask for something outside the connection.

Pages: read a page with read_page. Change it with edit_page, which finds an exact run of text and replaces it, so read the page first and copy the text you want to find.

Every error carries a code, such as UNAUTHENTICATED, FORBIDDEN, NOT_FOUND or BAD_USER_INPUT. Use the code to decide what to do next.

For anything the other tools do not cover, use graphql_query or graphql_mutate. Before writing one, use search_schema to find the fields you need and describe_type to see their arguments and types.`

export default mcpInstructions
