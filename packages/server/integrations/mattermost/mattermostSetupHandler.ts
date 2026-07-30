import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {SIGNIN_SLUG} from '../../../client/utils/constants'
import makeAppURL from '../../../client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import {generateOAuthClientId} from '../../oauth2/credentials'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import getReqAuth from '../../utils/getReqAuth'

// GET /mattermost/setup?mattermost_url=<url>&redirect_uri=<mm_callback>&state=<nonce>
// Admin-initiated setup flow from the Mattermost plugin admin page.
// Creates an IntegrationProvider + OAuthAPIProvider for the org and redirects
// back to the Mattermost plugin with the generated clientId.
const mattermostSetupHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const authToken = getReqAuth(req)
  const query = req.getQuery()

  if (!authToken?.sub) {
    const loginUrl = makeAppURL(appOrigin, `/${SIGNIN_SLUG}`, {
      searchParams: {redirectTo: `/mattermost/setup?${query}`}
    })
    res.writeStatus('302 Found').writeHeader('Location', loginUrl).end()
    return
  }

  const params = new URLSearchParams(query)
  const mattermostUrl = params.get('mattermost_url')
  const redirectUri = params.get('redirect_uri')
  const state = params.get('state')

  if (!mattermostUrl || !redirectUri || !state) {
    res.writeStatus('400 Bad Request').end('Missing required parameters')
    return
  }

  // Validate redirect_uri is on the configured Mattermost server to prevent open redirect
  let mattermostOrigin: string
  try {
    mattermostOrigin = new URL(mattermostUrl).origin
  } catch {
    res.writeStatus('400 Bad Request').end('Invalid mattermost_url')
    return
  }
  let redirectUriOrigin: string
  try {
    redirectUriOrigin = new URL(redirectUri).origin
  } catch {
    res.writeStatus('400 Bad Request').end('Invalid redirect_uri')
    return
  }
  if (redirectUriOrigin !== mattermostOrigin) {
    res.writeStatus('400 Bad Request').end('redirect_uri must be on the Mattermost server')
    return
  }

  const pg = getKysely()
  const userId = authToken.sub

  // Fetch orgs where the user is an admin
  const orgUsers = await pg
    .selectFrom('OrganizationUser')
    .innerJoin('Organization', 'Organization.id', 'OrganizationUser.orgId')
    .select(['OrganizationUser.orgId', 'Organization.name'])
    .where('OrganizationUser.userId', '=', userId)
    .where('OrganizationUser.removedAt', 'is', null)
    .where('OrganizationUser.role', 'in', ['BILLING_LEADER', 'ORG_ADMIN'])
    .execute()

  if (orgUsers.length === 0) {
    res.writeStatus('403 Forbidden').end('No admin organizations found for this user')
    return
  }

  // Show org selection form
  const orgOptions = orgUsers
    .map(
      ({orgId, name}) =>
        `<option value="${escapeHtml(orgId)}">${escapeHtml(name ?? orgId)}</option>`
    )
    .join('')

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Connect Mattermost to Parabol</title></head>
<body style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:0 16px">
  <h2>Connect Mattermost to Parabol</h2>
  <p>Select the Parabol organization to link with <strong>${escapeHtml(mattermostUrl)}</strong>:</p>
  <form method="POST" action="/mattermost/setup/confirm">
    <input type="hidden" name="mattermost_url" value="${escapeHtml(mattermostUrl)}">
    <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}">
    <input type="hidden" name="state" value="${escapeHtml(state)}">
    <select name="orgId" style="display:block;width:100%;margin:8px 0;padding:8px">
      ${orgOptions}
    </select>
    <button type="submit" style="padding:8px 16px;margin-top:8px">Connect</button>
  </form>
</body>
</html>`

  res.writeStatus('200 OK').writeHeader('Content-Type', 'text/html; charset=utf-8').end(html)
})

// POST /mattermost/setup/confirm — form submission from the setup page
export const mattermostSetupConfirmHandler = uWSAsyncHandler(
  async (res: HttpResponse, req: HttpRequest) => {
    const authToken = getReqAuth(req)
    if (!authToken?.sub) {
      res.writeStatus('401 Unauthorized').end()
      return
    }

    const rawBody = await parseBody({res, parser: (buf: Buffer) => buf.toString()})
    if (!rawBody) {
      res.writeStatus('400 Bad Request').end('Request body missing')
      return
    }

    const params = new URLSearchParams(rawBody)
    const mattermostUrl = params.get('mattermost_url')
    const redirectUri = params.get('redirect_uri')
    const state = params.get('state')
    const orgId = params.get('orgId')

    if (!mattermostUrl || !redirectUri || !state || !orgId) {
      res.writeStatus('400 Bad Request').end('Missing required parameters')
      return
    }

    // Verify redirect_uri origin matches the Mattermost server
    let mattermostOrigin: string
    let redirectUriOrigin: string
    try {
      mattermostOrigin = new URL(mattermostUrl).origin
      redirectUriOrigin = new URL(redirectUri).origin
    } catch {
      res.writeStatus('400 Bad Request').end('Invalid URL parameter')
      return
    }
    if (redirectUriOrigin !== mattermostOrigin) {
      res.writeStatus('400 Bad Request').end('redirect_uri must be on the Mattermost server')
      return
    }

    const pg = getKysely()
    const userId = authToken.sub

    // Verify user is admin of the selected org
    const orgUser = await pg
      .selectFrom('OrganizationUser')
      .selectAll()
      .where('userId', '=', userId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .where('role', 'in', ['BILLING_LEADER', 'ORG_ADMIN'])
      .executeTakeFirst()

    if (!orgUser) {
      res.writeStatus('403 Forbidden').end('Not an admin of this organization')
      return
    }

    const clientId = generateOAuthClientId()
    const parabolCallbackUri = `${appOrigin}/oauth/mattermost-callback`

    await pg.transaction().execute(async (trx) => {
      // Revoke old OAuthAPIProvider if re-running setup for this org
      const existing = await trx
        .selectFrom('IntegrationProvider')
        .select('clientId')
        .where('orgId', '=', orgId)
        .where('service', '=', 'mattermost')
        .where('authStrategy', '=', 'sharedSecret')
        .where('scope', '=', 'org')
        .executeTakeFirst()
      if (existing?.clientId) {
        await trx.deleteFrom('OAuthAPIProvider').where('clientId', '=', existing.clientId).execute()
      }

      // Upsert IntegrationProvider (primary Mattermost config, for outbound notifications)
      await trx
        .insertInto('IntegrationProvider')
        .values({
          service: 'mattermost',
          authStrategy: 'sharedSecret',
          scope: 'org',
          orgId,
          serverBaseUrl: mattermostUrl,
          clientId
        })
        .onConflict((oc) =>
          oc.columns(['orgId', 'teamId', 'service', 'authStrategy']).doUpdateSet({
            clientId,
            serverBaseUrl: mattermostUrl,
            isActive: true
          })
        )
        .execute()

      // Insert OAuthAPIProvider (keeps OAuthAPICode.clientId FK intact)
      await trx
        .insertInto('OAuthAPIProvider')
        .values({
          orgId,
          name: 'Mattermost Plugin',
          clientId,
          clientSecret: null,
          isPublicClient: true,
          redirectUris: [parabolCallbackUri],
          scopes: []
        })
        .execute()
    })

    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set('client_id', clientId)
    callbackUrl.searchParams.set('state', state)

    res.writeStatus('302 Found').writeHeader('Location', callbackUrl.toString()).end()
  }
)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default mattermostSetupHandler
