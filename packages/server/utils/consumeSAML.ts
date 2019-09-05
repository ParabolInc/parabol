import getRethink from '../database/rethinkDriver'
import SAML from '../database/types/SAML'
import * as samlify from 'samlify'
import * as validator from '@authenio/samlify-validate-with-xmllint'
import {RequestHandler} from 'express'
import sendToSentry from './sendToSentry'
import base64url from 'base64url'
import {SSORelayState} from '../graphql/queries/SAMLIdP'

const serviceProvider = samlify.ServiceProvider({})
const query = `
mutation LoginSSO($email: ID!, $isInvited: Boolean, $name: String!) {
  loginSSO(email: $email, isInvited: $isInvited, name: $name) {
    authToken
  }
}
`
samlify.setSchemaValidator(validator)
const consumeSAML = (intranetGraphQLHandler): RequestHandler => async (req, res) => {
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
      res.redirect('/saml-redirect')
    })
  if (!loginResponse) return
  const {RelayState} = req.body
  let relayState = {} as SSORelayState
  try {
    relayState = JSON.parse(base64url.decode(RelayState))
  } catch (e) {
    // ignore
  }
  const {isInvited} = relayState
  const {extract} = loginResponse
  const {attributes, nameID: name} = extract
  const {email} = attributes
  const internalReq = {body: {query, variables: {email, isInvited, name}}}
  const payload = await intranetGraphQLHandler(internalReq, res)
  const {data} = payload
  const authToken = data && data.loginSSO && data.loginSSO.authToken || ''
  if (!authToken) {
    const {errors} = payload
    if (errors) {
      const [error] = errors
      sendToSentry(error)
    } else {
      sendToSentry(new Error('No auth token received'))
    }
  }
  res.redirect(`/saml-redirect/${authToken}`)
}

export default consumeSAML
