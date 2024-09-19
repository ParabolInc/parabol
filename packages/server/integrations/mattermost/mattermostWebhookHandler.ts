import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import publishWebhookGQL from '../../utils/publishWebhookGQL'
import {createVerifier, httpbis} from 'http-message-signatures'

interface InvoiceEventCallBackArg {
  id: string
}

const eventLookup = {
  meetingTemplates: {
    getVars: (email: string) => ({email}),
    query: `
      query MeetingTemplates($email: String!) {
        user(email: $email) {
          availableTemplates(first: 2000) {
            edges {
              node {
                id
                name
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
} as const

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

  const {query, variables} = body ?? {}
  
  const event = eventLookup[query as keyof typeof eventLookup]
  if (!event) {
    res.writeStatus('400').end()
    return
  }
  const result = await publishWebhookGQL<{data: any}>(event.query, variables)
  if (result?.data) {
    // restructure the data to make it easier to digest
    const restructured = {
      availableTemplates: result.data.user.availableTemplates.edges.map((edge: any) => edge.node),
      teams: result.data.user.teams,
    }
    console.log('GEORG result', JSON.stringify(restructured, null, 2))
    res.writeStatus('200').writeHeader('Content-Type', 'application/json').end(JSON.stringify(restructured))
  } else {
    res.writeStatus('500').end()
  }
})

export default mattermostWebhookHandler
