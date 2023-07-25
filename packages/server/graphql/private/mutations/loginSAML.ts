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
import {samlXMLValidator} from '../../../utils/samlXMLValidator'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import {SSORelayState} from '../../queries/SAMLIdP'
import {MutationResolvers} from '../resolverTypes'

const serviceProvider = samlify.ServiceProvider({})
samlify.setSchemaValidator(samlXMLValidator)

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

  if (!doc) throw new Error(`${normalizedName} has not been created in Parabol yet`)
  const {domains, metadata} = doc
  const idp = samlify.IdentityProvider({metadata: metadata ?? undefined})
  let loginResponse
  try {
    loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
  } catch (e) {
    throw e
  }
  if (!loginResponse) {
    throw new Error('Error with query from identity provider')
  }
  const relayState = getRelayState(body)
  const {isInvited} = relayState
  const {extract} = loginResponse
  const {attributes, nameID: name} = extract
  const caseInsensitiveAttributes = {} as Record<string, string | undefined>
  Object.keys(attributes).forEach((key) => {
    const lowercaseKey = key.toLowerCase()
    const value = attributes[key]
    caseInsensitiveAttributes[lowercaseKey] = String(value)
  })
  const {email: inputEmail, emailaddress, displayname} = caseInsensitiveAttributes
  const preferredName = displayname || name
  const email = inputEmail?.toLowerCase() || emailaddress?.toLowerCase()
  if (!email) {
    throw new Error('Email attribute was not included in SAML response')
  }
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    throw new Error('Email is too long')
  }
  const ssoDomain = getSSODomainFromEmail(email)
  if (!ssoDomain || !domains.includes(ssoDomain)) {
    // don't blindly trust the IdP
    throw new Error(`${email} does not belong to ${domains.join(', ')}`)
  }

  const user = await getUserByEmail(email)
  if (user) {
    return {
      userId: user.id,
      authToken: encodeAuthToken(new AuthToken({sub: user.id, tms: user.tms, rol: user.rol})),
      isNewUser: false
    }
  }

  const userId = `sso|${generateUID()}`
  const tempUser = new User({
    id: userId,
    email,
    preferredName,
    tier: 'enterprise'
  })

  const authToken = await bootstrapNewUser(tempUser, !isInvited)
  return {
    userId,
    authToken: encodeAuthToken(authToken),
    isNewUser: true
  }
}

export default loginSAML
