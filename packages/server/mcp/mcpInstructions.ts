import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'

const scopes = Object.values(OAuthScopeEnum).join(', ')

const mcpInstructions = `Parabol is where teams run meetings (retrospectives, standups, sprint poker, check-ins), track tasks and write pages.

IDs are opaque. Pass back exactly the id you received; never build, parse or change one.

Each area needs its own scope. The scopes are ${scopes}. A :read scope lets you look and a :write scope lets you change. A call that needs a scope this connection lacks fails with FORBIDDEN.

A connection may be limited to some organizations, teams or pages. Anything outside them is out of reach, and a call that asks for it fails.

Start with get_me to learn who you are and which teams you can reach. To make a new page, call create_page and then set_page_content. To change a page, call read_page and then edit_page, which finds an exact run of text and replaces it, so copy the text you want to find from what read_page returned. To change a team's template, call select_template before the start_* tool that starts the meeting.

For anything else, use graphql_query to read and graphql_mutate to change data. Learn the schema with an introspection query such as { __type(name: "Task") { fields { name description } } } run through graphql_query.

Tool errors carry a code, such as UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, BAD_USER_INPUT or TOO_MANY_REQUESTS (with retryAfter, the seconds to wait). Use the code to decide what to do next. An argument of the wrong type, or a required one left out, may come back as a plain message instead.`

export default mcpInstructions
