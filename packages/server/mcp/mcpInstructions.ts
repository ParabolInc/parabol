const mcpInstructions = `Parabol is where teams run meetings (retrospectives, standups, sprint poker, check-ins and team health checks), track tasks and write pages.

Pages are a team's knowledge base: docs, notes, plans and decisions, nested under one another. When a meeting ends, Parabol files its summary as a page under the team's Meeting Summaries page; get_meeting gives it as summaryPageId. To find what a team knows or decided, use search_pages or list_pages, then read_page.

For numbers about teams, such as active users, meetings held, tasks done or team health scores over time, use get_report; list_pinned_reports gives specs that work.

To run a retro with your own columns, call create_retro_template, select_template and start_retrospective, then list_retro_columns for the column ids add_reflection needs.

IDs are opaque. Pass back exactly the id you received; never build, parse or change one.

Each tool names the scopes it needs. A :read scope lets you look and a :write scope lets you change. A call needing a scope this connection lacks fails with FORBIDDEN, naming the scope.

A connection may be limited to some organizations, teams or pages. A call for anything outside them fails.

Start with get_me to learn who you are and which teams you can reach. To make a page, call create_page (teamId for a team, parentPageId to nest), then set_page_content. To change one, read_page, then edit_page. upload_from_url copies an online image. For another template, call select_template before start_*.

For anything else, use graphql_query to read and graphql_mutate to change data. Learn the schema with describe_graphql, such as Task or Mutation.createPage.

Tool errors carry a code, such as FORBIDDEN, NOT_FOUND, BAD_USER_INPUT or TOO_MANY_REQUESTS (with retryAfter, the seconds to wait). Use it to decide what to do next. An argument of the wrong type, or a missing one, may come back as a plain message.`

export default mcpInstructions
