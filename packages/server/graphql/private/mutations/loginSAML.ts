import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import querystring from 'querystring'
import * as samlify from 'samlify'
import {InvoiceItemType} from '../../../../client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
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
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'
import getSignOnURL from '../../public/mutations/helpers/SAMLHelpers/getSignOnURL'
import {SSORelayState} from '../../public/queries/SAMLIdP'
import {MutationResolvers} from '../resolverTypes'
import {generateIdenticon} from './helpers/generateIdenticon'
import {shouldRefreshMetadata} from './helpers/shouldRefreshMetadata'

const serviceProvider = samlify.ServiceProvider({})
samlify.setSchemaValidator(samlXMLValidator)

const CLAIM_SPEC = {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'name',
  'http://schemas.microsoft.com/identity/claims/displayname': 'displayname'
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
  const {metadataURL: newMetadataURL, isInvited} = relayState
  const doc = await dataLoader.get('saml').load(normalizedName)
  dataLoader.get('saml').clear(normalizedName)

  if (!doc)
    return {
      error: {
        message: `Ask customer service to enable SSO for ${normalizedName}.`
      }
    }
  const {
    domains,
    metadata: existingMetadata,
    metadataURL: existingMetadataURL,
    orgId,
    samlOrgAttribute
  } = doc

  const shouldRefresh = shouldRefreshMetadata(doc)
  const fetchMetadataUrl = newMetadataURL || (shouldRefresh ? existingMetadataURL : null)
  if (fetchMetadataUrl) {
    console.log('Fetching new SAML metadata', {shouldRefresh, newMetadataURL})
  }

  const newMetadata = fetchMetadataUrl ? await getSSOMetadataFromURL(fetchMetadataUrl) : undefined
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
  const {attributes, nameID} = extract
  const normalizedAttributes = Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      const normalizedKey = CLAIM_SPEC[key as keyof typeof CLAIM_SPEC] ?? key.toLowerCase()
      // This happens if the IdP sends duplicate claims
      if (Array.isArray(value)) {
        return [normalizedKey, Array.from(new Set(value.map(String))).toString()]
      }
      return [normalizedKey, String(value)]
    })
  )

  const {email: inputEmail, emailaddress, displayname, name} = normalizedAttributes
  const preferredName = displayname || name || nameID
  const email = inputEmail?.toLowerCase() || emailaddress?.toLowerCase()
  if (!email) {
    return standardError(
      new Error(
        `Email attribute is missing from the SAML response. The following attributes were included: ${Object.keys(attributes).join(', ')}`
      ),
      {extras: {attributes}}
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
      .set({metadata: newMetadata, metadataURL: fetchMetadataUrl})
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

  // find orgs specified in the SAML claim
  const orgIds = await (async () => {
    if (!samlOrgAttribute) {
      return []
    }
    const samlOrgIdsAttribute = attributes[samlOrgAttribute]
    if (!samlOrgIdsAttribute) {
      // This is probably a misconfiguration but should not stop us from accepting the new user
      sendToSentry(
        new Error(
          `The SAML attribute ${samlOrgAttribute} is missing from the SAML response. The following attributes were included: ${Object.keys(attributes).join(', ')}`
        )
      )
      return []
    }
    const samlOrgIds = Array.isArray(samlOrgIdsAttribute)
      ? samlOrgIdsAttribute
      : [samlOrgIdsAttribute]
    if (samlOrgIds.length === 0) {
      return []
    }
    const orgs = await pg
      .selectFrom('Organization')
      .select('id')
      .where('samlId', 'in', samlOrgIds)
      .execute()
    return orgs.map(({id}) => id)
  })()

  // if we don't provision via SAML claim, we default to the orgId from the SAML document
  if (!samlOrgAttribute && orgId) {
    orgIds.push(orgId)
  }

  const isOrganic = orgIds.length > 0 && !isInvited
  const authToken = await bootstrapNewUser(tempUser, !isOrganic, dataLoader)

  await Promise.all(
    orgIds.map((orgId) => adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader))
  )

  return {
    userId,
    authToken: encodeAuthToken(authToken),
    isNewUser: true
  }
}

export default loginSAML
