import getRethink from '../database/rethinkDriver'
import SAML from '../database/types/SAML'
import * as samlify from 'samlify'
import * as validator from '@authenio/samlify-node-xmllint'
import {RequestHandler} from 'express'
import sendToSentry from './sendToSentry'
import base64url from 'base64url'
import {SSORelayState} from '../graphql/queries/SAMLIdP'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import ServerAuthToken from '../database/types/ServerAuthToken'
import privateGraphQLEndpoint from '../graphql/privateGraphQLEndpoint'

const serviceProvider = samlify.ServiceProvider({})
const query = `
mutation LoginSSO($email: ID!, $isInvited: Boolean, $name: String!) {
  loginSSO(email: $email, isInvited: $isInvited, name: $name) {
    authToken
  }
}
`
samlify.setSchemaValidator(validator)

const getRelayState = (req: any) => {
  const {RelayState} = req.body
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

const consumeSAML: RequestHandler = async (req, res) => {
  const {params} = req
  const {domain} = params
  if (!domain) return
  const r = getRethink()
  const doc = await r.table('SAML')
    .getAll(domain, {index: 'domain'})
    .nth(0)
    .default(null) as SAML | null
  if (!doc) return
  const {metadata} = doc
  const idp = samlify.IdentityProvider({metadata})
  const loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', req)
    .catch((e) => {
      sendToSentry(e)
      const error = 'Invalid response from Identity Provider. Try again.'
      res.redirect(`/saml-redirect?error=${error}`)
    })
  if (!loginResponse) return
  const relayState = getRelayState(req)
  const {isInvited} = relayState
  const {extract} = loginResponse
  const {attributes, nameID: name} = extract
  const {email} = attributes
  const ssoDomain = getSSODomainFromEmail(email)
  if (ssoDomain !== domain) {
    // don't blindly trust the IdP
    const error = `Email domain must be ${domain}`
    res.redirect(`/saml-redirect?error=${error}`)
  }
  const serverAuthToken = new ServerAuthToken()
  const variables = {email, isInvited, name}
  const payload = await privateGraphQLEndpoint(query, variables, serverAuthToken)
  const {data} = payload
  const authToken = data && data.loginSSO && data.loginSSO.authToken || ''
  if (!authToken) {
    const error = getError(payload)
    res.redirect(`/saml-redirect?error=${error}`)
  } else {
    res.redirect(`/saml-redirect?token=${authToken}`)
  }
}

export default consumeSAML
