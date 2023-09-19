import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import AuthToken from '../../../database/types/AuthToken'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {samlXMLValidator} from '../../../utils/samlXMLValidator'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import getSignOnURL from '../../public/mutations/helpers/SAMLHelpers/getSignOnURL'
import {SSORelayState} from '../../queries/SAMLIdP'
import {MutationResolvers} from '../resolverTypes'

const serviceProvider = samlify.ServiceProvider({})
samlify.setSchemaValidator(samlXMLValidator)

const getRelayState = (body: querystring.ParsedUrlQuery) => {
  let relayState = {} as SSORelayState
  try {
    relayState = JSON.parse(base64url.decode(body.RelayState as string))
  } catch (e) {
    // ignore
  }
  return relayState
}

const loginSAML: MutationResolvers['loginSAML'] = async (
  _source,
  {samlName, queryString},
  {dataLoader}
) => {
  const pg = getKysely()

  const normalizedName = samlName.trim().toLowerCase()
  const body = querystring.parse(queryString)
  const relayState = getRelayState(body)
  const {isInvited, metadata: newMetadata} = relayState
  const doc = await dataLoader.get('saml').load(normalizedName)
  dataLoader.get('saml').clear(normalizedName)

  if (!doc)
    return {
      error: {
        message: `Ask customer service to enable SSO for ${normalizedName}.`
      }
    }
  const {domains, metadata: existingMetadata} = doc
  const metadata = newMetadata || existingMetadata
  if (!metadata) {
    return {error: {message: 'No metadata found! Please contact customer service'}}
  }
  const idp = samlify.IdentityProvider({metadata})
  let loginResponse
  try {
    loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
  } catch (e) {
    const message =
      e instanceof Error ? e.message : typeof e === 'string' ? e : 'parseLoginResponse failed'
    return {error: {message}}
  }
  if (!loginResponse) {
    return {error: {message: 'Error with query from identity provider'}}
  }

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

  if (newMetadata) {
    // The user is updating their SAML metadata
    // Revalidate it & persist to DB
    const url = getSignOnURL(metadata, normalizedName)
    if (url instanceof Error) {
      return {error: {message: url.message}}
    }
    await pg
      .updateTable('SAML')
      .set({metadata: newMetadata, url})
      .where('id', '=', normalizedName)
      .execute()
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
