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
import {isSingleTenantSSO} from '../../../utils/getSAMLURLFromEmail'
import {getSSOMetadataFromURL} from '../../../utils/getSSOMetadataFromURL'
import {samlXMLValidator} from '../../../utils/samlXMLValidator'
import standardError from '../../../utils/standardError'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import getSignOnURL from '../../public/mutations/helpers/SAMLHelpers/getSignOnURL'
import {SSORelayState} from '../../public/queries/SAMLIdP'
import {MutationResolvers} from '../resolverTypes'
import {generateIdenticon} from './helpers/generateIdenticon'

const serviceProvider = samlify.ServiceProvider({})
samlify.setSchemaValidator(samlXMLValidator)

const CLAIM_SPEC = {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'displayname'
}

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
  const {isInvited, metadataURL: newMetadataURL} = relayState
  const doc = await dataLoader.get('saml').load(normalizedName)
  dataLoader.get('saml').clear(normalizedName)

  if (!doc)
    return {
      error: {
        message: `Ask customer service to enable SSO for ${normalizedName}.`
      }
    }
  const {domains, metadata: existingMetadata} = doc
  const newMetadata = newMetadataURL ? await getSSOMetadataFromURL(newMetadataURL) : undefined
  if (newMetadata instanceof Error) {
    return standardError(newMetadata)
  }
  const metadata = newMetadata || existingMetadata
  if (!metadata) {
    return {error: {message: 'No metadata found! Please contact customer service'}}
  }
  const idp = samlify.IdentityProvider({metadata})
  let loginResponse
  try {
    loginResponse = await serviceProvider.parseLoginResponse(idp, 'post', {body})
  } catch (e) {
    if (e instanceof Error) {
      return standardError(e)
    }
    const message = typeof e === 'string' ? e : 'parseLoginResponse failed'
    return standardError(new Error(message), {extras: {body}})
  }
  if (!loginResponse) {
    return standardError(new Error('Error with query from identity provider'), {extras: {body}})
  }

  const {extract} = loginResponse
  const {attributes, nameID: name} = extract
  const normalizedAttributes = Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      const normalizedKey = CLAIM_SPEC[key as keyof typeof CLAIM_SPEC] ?? key.toLowerCase()
      return [normalizedKey, String(value)]
    })
  )
  const {email: inputEmail, emailaddress, displayname} = normalizedAttributes
  const preferredName = displayname || name
  const email = inputEmail?.toLowerCase() || emailaddress?.toLowerCase()
  if (!email) {
    return standardError(
      new Error(
        `Email attribute is missing from the SAML response. The following attributes were included: ${Object.keys(attributes).join(', ')}`
      ),
      {extras: {body}}
    )
  }
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    return {error: {message: 'Email is too long'}}
  }
  const ssoDomain = getSSODomainFromEmail(email)
  if (!ssoDomain || !domains.includes(ssoDomain)) {
    if (!isSingleTenantSSO) {
      // don't blindly trust the IdP unless there is only 1
      return standardError(new Error(`${email} does not belong to ${domains.join(', ')}`), {
        extras: {attributes}
      })
    }
  }

  if (newMetadata) {
    // The user is updating their SAML metadata
    // Revalidate it & persist to DB
    // Generate the URL to verify the metadata, don't persist it as it needs to be generated fresh
    const url = getSignOnURL(metadata, normalizedName)
    if (url instanceof Error) {
      return standardError(url)
    }
    await pg
      .updateTable('SAML')
      .set({metadata: newMetadata, metadataURL: newMetadataURL})
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
  const picture = await generateIdenticon(userId, preferredName)
  const tempUser = new User({
    id: userId,
    email,
    preferredName,
    picture,
    tier: 'enterprise'
  })

  const authToken = await bootstrapNewUser(tempUser, !isInvited, dataLoader)
  return {
    userId,
    authToken: encodeAuthToken(authToken),
    isNewUser: true
  }
}

export default loginSAML
