import * as validator from '@authenio/samlify-node-xmllint'
import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import qs from 'qs'
import * as samlify from 'samlify'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import getRethink from '../database/rethinkDriver'
import SAML from '../database/types/SAML'
import ServerAuthToken from '../database/types/ServerAuthToken'
import executeGraphQL from '../graphql/executeGraphQL'
import {SSORelayState} from '../graphql/queries/SAMLIdP'
import resDataToBuffer from '../resDataToBuffer'
import sendToSentry from './sendToSentry'

const serviceProvider = samlify.ServiceProvider({})
const query = `
mutation LoginSSO($email: ID!, $isInvited: Boolean, $name: String!) {
  loginSSO(email: $email, isInvited: $isInvited, name: $name) {
    authToken
  }
}
`
samlify.setSchemaValidator(validator)

const getRelayState = (body: any) => {
  const {RelayState} = body
  let relayState = {} as SSORelayState
  try {
    relayState = JSON.parse(base64url.decode(RelayState))
  } catch (e) {
    // ignore
  }
  return relayState
}

const getError = (payload: any) => {
  const {errors} = payload
  if (errors) {
    sendToSentry(errors[0])
    return errors[0].message
  }
  const error = 'No auth token received'
  sendToSentry(new Error(error))
  return error
}

const redirectOnIDPError = (res: HttpResponse) => {
  const error = 'Invalid response from Identity Provider. Try again.'
  res
    .writeStatus('302 Found')
    .writeHeader('location', `/saml-redirect?error=${error}`)
    .end()
}

const consumeSAML = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('consumeSAML aborted')
  })
  const domain = req.getParameter(0)
  if (!domain) {
    res.writeStatus('400 Bad Request').end()
    return
  }
  resDataToBuffer(res, async (buffer) => {
    const octetString = buffer.toString()
    const body = qs.parse(octetString, {
      allowPrototypes: true,
      arrayLimit: 100,
      depth: Infinity,
      parameterLimit: 1000
    })
    const request = {query: body, octetString, body}
    const r = await getRethink()
    const doc = (await r
      .table('SAML')
      .getAll(domain, {index: 'domain'})
      .nth(0)
      .default(null)
      .run()) as SAML | null
    if (!doc) {
      res.writeStatus('400 Bad Request').end()
      return
    }
    const {metadata} = doc
    const idp = samlify.IdentityProvider({metadata})
    let loginResponse
    try {
      loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', request)
    } catch (e) {
      console.log(e)
      redirectOnIDPError(res)
      return
    }
    if (!loginResponse) {
      redirectOnIDPError(res)
      return
    }
    const relayState = getRelayState(body)
    const {isInvited} = relayState
    const {extract} = loginResponse
    const {attributes, nameID: name} = extract
    const {email} = attributes
    const ssoDomain = getSSODomainFromEmail(email)
    if (ssoDomain !== domain) {
      // don't blindly trust the IdP
      const error = `Email domain must be ${domain}`
      res
        .writeStatus('302 Found')
        .writeHeader('location', `/saml-redirect?error=${error}`)
        .end()
      return
    }
    const serverAuthToken = new ServerAuthToken()
    const variables = {email, isInvited, name}
    const payload = await executeGraphQL({
      authToken: serverAuthToken,
      query,
      variables,
      isPrivate: true
    })
    const {data} = payload
    const authToken = data?.loginSSO?.authToken ?? ''
    if (!authToken) {
      const error = getError(payload)
      res
        .writeStatus('302 Found')
        .writeHeader('location', `/saml-redirect?error=${error}`)
        .end()
    } else {
      res
        .writeStatus('302 Found')
        .writeHeader('location', `/saml-redirect?token=${authToken}`)
        .end()
    }
  })
}

export default consumeSAML
