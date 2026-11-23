import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const GET_ME = `
  query GetMe {
    viewer {
      id
      preferredName
      email
      organizations {
        id
        name
      }
      teams {
        id
        name
        orgId
      }
    }
  }
`

export default defineTool({
  name: 'get_me',
  title: 'Get me',
  description:
    'Show who this connection acts as, with the organizations and teams it reaches. Start here to find the teamId other tools ask for. Needs users:read, orgs:read and teams:read.',
  inputSchema: {},
  annotations: readAnnotations,
  run: async (context) => toolResult(await runGraphQL(context, GET_ME))
})
