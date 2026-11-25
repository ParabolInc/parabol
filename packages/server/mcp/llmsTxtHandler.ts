import type {HttpResponse} from 'uWebSockets.js'
import appOrigin from '../appOrigin'

const llmsTxt = `# Parabol

> Parabol is an open-source app where teams run meetings (retrospectives, standups, sprint poker, check-ins and team health checks), track tasks and write pages. Its MCP server lets an AI agent read and change that work as the person who connects it.

The MCP server is at ${appOrigin}/mcp. It speaks Streamable HTTP and is stateless: POST each JSON-RPC message and the reply comes back as JSON, with no session and no event stream.

## Connect

- [MCP server](${appOrigin}/mcp): Streamable HTTP, POST only, JSON responses
- [Protected resource metadata](${appOrigin}/.well-known/oauth-protected-resource/mcp): where a client starts OAuth discovery
- [Authorization server metadata](${appOrigin}/.well-known/oauth-authorization-server): OAuth 2.1 for public clients, with PKCE (S256) and refresh tokens
- [Client registration](${appOrigin}/oauth/register): dynamic client registration, so a client needs no setup
- [Personal access tokens](${appOrigin}/me/profile): made on your profile, they also work as a bearer token

## Access

- You choose a connection's scopes on the consent screen, or when you make a personal access token. A :read scope lets an agent look and a :write scope lets it change. Each tool names the scopes it needs, and a call without one fails with FORBIDDEN.
- A connection can be limited to some organizations, teams or pages. A page includes the pages nested under it.
- IDs are opaque: pass back exactly the id a tool returned.

## Tools

- You and your teams: \`get_me\`
- Reading meetings: \`list_meetings\`, \`get_meeting\`, \`get_standup\`, \`get_poker_meeting\`, \`get_team_health_meeting\`, \`list_discussions\`, \`get_discussion\`, \`list_retro_columns\`
- Running meetings: \`start_retrospective\`, \`start_standup\`, \`start_sprint_poker\`, \`start_check_in\`, \`start_team_health\`, \`end_meeting\`
- Taking part: \`add_reflection\`, \`update_reflection\`, \`answer_standup\`, \`add_poker_stories\`, \`vote_poker_story\`, \`reveal_poker_votes\`, \`set_poker_final_score\`, \`answer_team_health\`, \`add_comment\`
- Templates: \`list_templates\`, \`select_template\`, \`create_retro_template\`, \`create_standup_template\`, \`create_team_health_template\`
- Tasks: \`list_tasks\`, \`create_task\`, \`update_task\`
- Pages: \`search_pages\`, \`list_pages\`, \`read_page\`, \`create_page\`, \`set_page_content\`, \`edit_page\`, \`upload_image\`, \`upload_from_url\`
- Reports: \`get_report\`, \`list_pinned_reports\`
- Anything else: \`graphql_query\` reads, \`graphql_mutate\` changes, and \`describe_graphql\` explains the schema

## Docs

- [Parabol MCP server](https://www.parabol.co/support/mcp/): connecting a client and using the tools
- [Source](https://github.com/ParabolInc/parabol/tree/master/packages/server/mcp): the server, its tools and their GraphQL operations, for contributors
`

const llmsTxtHandler = (res: HttpResponse) => {
  res.writeStatus('200 OK')
  res.writeHeader('Content-Type', 'text/plain; charset=utf-8')
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.end(llmsTxt)
}

export default llmsTxtHandler
