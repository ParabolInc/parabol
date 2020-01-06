import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ServerAuthToken from '../database/types/ServerAuthToken'
import executeGraphQL from '../graphql/executeGraphQL'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'

const query = `
mutation LoginSAML($queryString: String!, $domain: String!) {
  loginSAML(queryString: $queryString, domain: $domain) {
    error {
      message
    }
    authToken
  }
}
`

const redirectOnError = (res: HttpResponse, error: string) => {
  res
    .writeStatus('302')
    .writeHeader('location', `/saml-redirect?error=${error}`)
    .end()
}

const GENERIC_ERROR = 'Error signing in|Please try again'

const SAMLhandler23 = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const domain = req.getParameter(0)
  if (!domain) {
    redirectOnError(res, 'No Domain Provided!|Did you set up the service provider correctly?')
    return
  }
  const parser = (buffer: Buffer) => buffer.toString()
  const queryString = await parseBody(res, parser)
  const payload = await executeGraphQL({
    authToken: new ServerAuthToken(),
    query,
    variables: {domain, queryString},
    isPrivate: true
  })
  const {data, errors} = payload
  if (!data || errors) {
    redirectOnError(res, GENERIC_ERROR)
    return
  }
  const {loginSAML} = data
  const {error, authToken} = loginSAML
  if (!authToken) {
    const message = error?.message || GENERIC_ERROR
    redirectOnError(res, message)
    return
  }
  res.cork(() => {
    res
      .writeStatus('302')
      .writeHeader('location', `/saml-redirect?token=${authToken}`)
      .end()
  })
})

export default SAMLhandler23
