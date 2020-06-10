import * as validator from '@authenio/samlify-node-xmllint'
import base64url from 'base64url'
import {GraphQLNonNull, GraphQLString} from 'graphql'
import {TierEnum} from 'parabol-client/types/graphql'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import shortid from 'shortid'
import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import SAML from '../../../database/types/SAML'
import User from '../../../database/types/User'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {SSORelayState} from '../../queries/SAMLIdP'
import LoginSAMLPayload from '../types/LoginSAMLPayload'

const serviceProvider = samlify.ServiceProvider({})
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

const loginSAML = {
  type: new GraphQLNonNull(LoginSAMLPayload),
  description: 'Log in using SAML single sign on (SSO)',
  args: {
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The querystring provided by the iDP including SAMLResponse and RelayState'
    },
    domain: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The domain the viewer is attempting to login to'
    }
  },
  async resolve(_source, {domain, queryString}) {
    const r = await getRethink()
    const now = new Date()
    const body = querystring.parse(queryString)
    const normalizedDomain = domain.toLowerCase()
    const doc = (await r
      .table('SAML')
      .getAll(normalizedDomain, {index: 'domain'})
      .nth(0)
      .default(null)
      .run()) as SAML | null
    if (!doc) return {error: {message: 'Domain not yet created on Parabol'}}
    const {metadata} = doc
    const idp = samlify.IdentityProvider({metadata})
    let loginResponse
    try {
      loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
    } catch (e) {
      return {error: {message: e.message}}
    }
    if (!loginResponse) {
      return {error: {message: 'Error with query from identity provider'}}
    }
    const relayState = getRelayState(body)
    const {isInvited} = relayState
    const {extract} = loginResponse
    const {attributes, nameID: name} = extract
    const email = attributes.email.toLowerCase()
    const ssoDomain = getSSODomainFromEmail(email)
    if (ssoDomain !== normalizedDomain) {
      // don't blindly trust the IdP
      return {error: {message: `Email domain must be ${normalizedDomain}`}}
    }

    const user = await r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null)
      .run()
    if (user) {
      return {
        authToken: encodeAuthToken(new AuthToken({sub: user.id, tms: user.tms}))
      }
    }

    const userId = `sso|${shortid.generate()}`
    const newUser = new User({
      id: userId,
      email,
      preferredName: name,
      lastSeenAt: now,
      tier: TierEnum.enterprise
    })

    const authToken = await bootstrapNewUser(newUser, !isInvited)
    return {
      authToken: encodeAuthToken(authToken)
    }
  }
}

export default loginSAML
