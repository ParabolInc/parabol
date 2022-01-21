import * as validator from '@authenio/samlify-node-xmllint'
import base64url from 'base64url'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
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
      description: 'The querystring provided by the IdP including SAMLResponse and RelayState'
    },
    samlName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the SAML identifier. The slug used in the redirect URL'
    }
  },
  async resolve(
    _source: unknown,
    {samlName, queryString}: {samlName: string; queryString: string}
  ) {
    const r = await getRethink()
    const body = querystring.parse(queryString)
    const normalizedName = samlName.trim().toLowerCase()
    const doc = await r.table('SAML').get(normalizedName).run()

    if (!doc) return {error: {message: `${normalizedName} has not been created in Parabol yet`}}
    const {domains, metadata} = doc
    const idp = samlify.IdentityProvider({metadata})
    let loginResponse
    try {
      loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
    } catch (e) {
      const message = e instanceof Error ? e.message : 'parseLoginResponse failed'
      return {error: {message}}
    }
    if (!loginResponse) {
      return {error: {message: 'Error with query from identity provider'}}
    }
    const relayState = getRelayState(body)
    const {isInvited} = relayState
    const {extract} = loginResponse
    const {attributes, nameID: name} = extract
    const caseInsensitiveAtttributes = {} as Record<Lowercase<string>, Lowercase<string>>
    Object.keys(attributes).forEach((key) => {
      const lowercaseKey = key.toLowerCase()
      const value = attributes[key]
      const lowercaseValue = String(value).toLowerCase()
      caseInsensitiveAtttributes[lowercaseKey] = lowercaseValue
    })
    const {email: inputEmail, emailaddress} = caseInsensitiveAtttributes
    const email = inputEmail || emailaddress
    if (!email) {
      return {error: {message: 'Email attribute was not included in SAML response'}}
    }
    if (email.length > USER_PREFERRED_NAME_LIMIT) {
      return {error: {message: 'Email is too long'}}
    }
    const ssoDomain = getSSODomainFromEmail(email)
    if (!ssoDomain || !domains.includes(ssoDomain)) {
      // don't blindly trust the IdP
      return {error: {message: `${email} does not belong to ${domains.join(', ')}`}}
    }

    const user = await getUserByEmail(email)
    if (user) {
      return {
        authToken: encodeAuthToken(new AuthToken({sub: user.id, tms: user.tms, rol: user.rol}))
      }
    }

    const userId = `sso|${generateUID()}`
    const newUser = new User({
      id: userId,
      email,
      preferredName: name,
      tier: 'enterprise'
    })

    const authToken = await bootstrapNewUser(newUser, !isInvited)
    return {
      authToken: encodeAuthToken(authToken)
    }
  }
}

export default loginSAML
