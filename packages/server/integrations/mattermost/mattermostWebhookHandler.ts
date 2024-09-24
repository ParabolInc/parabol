import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import {createVerifier, httpbis} from 'http-message-signatures'
import {Variables} from 'relay-runtime'
import getGraphQLExecutor from '../../utils/getGraphQLExecutor'
import sendToSentry from '../../utils/sendToSentry'
import AuthToken from '../../database/types/AuthToken'
import getKysely from '../../postgres/getKysely'

const eventLookup = {
  meetingTemplates: {
    getVars: (email: string) => ({email}),
    query: `
      query MeetingTemplates($email: String!) {
        viewer {
          availableTemplates(first: 2000) {
            edges {
              node {
                id
                name
                type
                illustrationUrl
                orgId
                teamId
              }
            }
          }
          teams {
            id
            name
          }
        }
      }
    `
  },
  startRetrospective: {
    getVars: (selectedTemplateId: string, teamId: string) => ({selectedTemplateId, teamId}),
    query: `
      mutation StartActivity(
        $selectedTemplateId: ID!
        $teamId: ID!
      ) {
        selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
          meetingSettings {
            id
          }
        }
        startRetrospective(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `
  },

} as const

const publishWebhookGQL = async <NarrowResponse>(
  query: string,
  variables: Variables,
  email: string,
) => {
  const pg = getKysely()
  const user = await pg.selectFrom('User').selectAll().where('email', '=', email).executeTakeFirstOrThrow()
  try {
    const authToken = new AuthToken({sub: user.id, tms: user.tms})
    return await getGraphQLExecutor().publish<NarrowResponse>({
      authToken,
      query,
      variables,
      isPrivate: false,
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error('GQL executor failed to publish')
    sendToSentry(error, {tags: {query: query.slice(0, 50)}})
    return undefined
  }
}


const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    'signature': req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input'),
  }
  console.log('GEORG headers', headers)

  const keys = new Map();
  keys.set('', {
      id: '',
      algs: ['hmac-sha256'],
      verify: createVerifier(process.env.SERVER_SECRET!, 'hmac-sha256'),
  });
  console.log('GEORG keys', keys)
  // minimal verification
  const verified = await httpbis.verifyMessage({
      // logic for finding a key based on the signature parameters
      async keyLookup(params: any) {
        console.log('GEORG keyLookup', params)
          const keyId = params.keyid;
          // lookup and return key - note, we could also lookup using the alg too (`params.alg`)
          // if there is no key, `verifyMessage()` will throw an error
          return keys.get('');
      },
  }, {
      method: req.getMethod(),
      url: 'http://localhost:3001' + req.getUrl(),
      headers
  });
  console.log('GEORG verified', verified);
  if (!verified) {
    res.writeStatus('401').end()
    return
  }

  const body = (await parseBody({res})) as any

  const {query, variables, email} = body ?? {}
  
  const event = eventLookup[query as keyof typeof eventLookup]
  if (!event) {
    console.log('GEORG event not found', query)
    res.writeStatus('400').end()
    return
  }
  const result = await publishWebhookGQL<{data: any}>(event.query, variables, email)
  if (result?.data) {
    // restructure the data to make it easier to digest
    const restructured = {
      availableTemplates: result.data.viewer.availableTemplates.edges.map((edge: any) => edge.node),
      teams: result.data.viewer.teams,
    }
    console.log('GEORG result', JSON.stringify(restructured, null, 2))
    res.writeStatus('200').writeHeader('Content-Type', 'application/json').end(JSON.stringify(restructured))
  } else {
    res.writeStatus('500').end()
  }
})

export default mattermostWebhookHandler
