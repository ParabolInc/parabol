import * as validator from '@authenio/samlify-node-xmllint'
import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {SSORelayState} from '../../queries/SAMLIdP'
import {MutationResolvers} from '../resolverTypes'

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

const loginSAML: MutationResolvers['loginSAML'] = async (_source, {samlName, queryString}) => {
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
  const caseInsensitiveAtttributes = {} as Record<Lowercase<string>, string | undefined>
  Object.keys(attributes).forEach((key) => {
    const lowercaseKey = key.toLowerCase()
    const value = attributes[key]
    caseInsensitiveAtttributes[lowercaseKey] = String(value)
  })
  const {email: inputEmail, emailaddress, displayname} = caseInsensitiveAtttributes
  const preferredName = displayname || name
  const email = inputEmail?.toLowerCase() || emailaddress?.toLowerCase()
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
    preferredName,
    tier: 'enterprise'
  })

  const authToken = await bootstrapNewUser(newUser, !isInvited)
  return {
    authToken: encodeAuthToken(authToken)
  }
}

export default loginSAML
