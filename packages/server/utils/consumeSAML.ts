import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ServerAuthToken from '../database/types/ServerAuthToken'
import executeGraphQL from '../graphql/executeGraphQL'
import resDataToBuffer from '../resDataToBuffer'

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
    .writeStatus('302 Found')
    .writeHeader('location', `/saml-redirect?error=${error}`)
    .end()
}

const GENERIC_ERROR = 'Error signing in|Please try again'

const consumeSAMLBuffer = (res: HttpResponse, domain: string) => async (buffer: Buffer) => {
  const queryString = buffer.toString()
  const payload = await executeGraphQL({
    authToken: new ServerAuthToken(),
    query,
    variables: {domain, queryString},
    isPrivate: true
  })
  const {data, errors} = payload
  if (!data || errors) {
    return redirectOnError(res, GENERIC_ERROR)
  }
  const {loginSAML} = data
  const {error, authToken} = loginSAML
  if (!authToken) {
    const message = error?.message || GENERIC_ERROR
    return redirectOnError(res, message)
  }
  res
    .writeStatus('302 Found')
    .writeHeader('location', `/saml-redirect?token=${authToken}`)
    .end()
}

const consumeSAML = (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('consumeSAML aborted')
  })
  const domain = req.getParameter(0)
  if (!domain) {
    return redirectOnError(
      res,
      'No Domain Provided!|Did you set up the service provider correctly?'
    )
  }
  resDataToBuffer(res, consumeSAMLBuffer(res, domain))
}

export default consumeSAML
