import ms from 'ms'
import appOrigin from '../../appOrigin'
import AuthToken from '../../database/types/AuthToken'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import getKysely from '../../postgres/getKysely'
import encodeAuthToken from '../../utils/encodeAuthToken'

/**
 * Handles the OAuth2 callback for the Mattermost plugin.
 *
 * After the user logs in to Parabol and the authorize endpoint redirects here with a
 * short-lived code, this handler:
 *   1. Validates the code belongs to the Mattermost OAuth client
 *   2. Exchanges it for a Parabol auth token (server-side — no client_secret exposure)
 *   3. Returns an HTML page that postMessages {authToken, nonce} back to the opener
 *      (the Mattermost plugin popup) and closes itself
 */
const mattermostOAuthCallbackHandler = uWSAsyncHandler(async (res, req) => {
  const clientId = process.env.MATTERMOST_OAUTH_CLIENT_ID
  if (!clientId) {
    res.writeStatus('503').end('Mattermost OAuth not configured')
    return
  }

  const query = req.getQuery()
  const params = new URLSearchParams(query)
  const code = params.get('code')
  const stateParam = params.get('state')

  if (!code || !stateParam) {
    res.writeStatus('400').end('Missing code or state')
    return
  }

  // Decode state to get {nonce, origin} set by the Mattermost JS plugin
  let nonce: string
  let openerOrigin: string
  try {
    const stateObj = JSON.parse(Buffer.from(stateParam, 'base64').toString())
    nonce = stateObj.nonce
    openerOrigin = stateObj.origin
    if (!nonce || !openerOrigin) throw new Error('Invalid state shape')
  } catch {
    res.writeStatus('400').end('Invalid state parameter')
    return
  }

  // Validate opener origin against the configured Mattermost URL
  const mattermostUrl = process.env.MATTERMOST_URL
  if (mattermostUrl) {
    try {
      const expectedOrigin = new URL(mattermostUrl).origin
      if (openerOrigin !== expectedOrigin) {
        res.writeStatus('400').end('Origin mismatch')
        return
      }
    } catch {
      res.writeStatus('500').end('Invalid MATTERMOST_URL configuration')
      return
    }
  }

  const expectedRedirectUri = appOrigin + '/mattermost/callback'

  const pg = getKysely()
  // Delete-and-return atomically to prevent code reuse
  const oauthCode = await pg
    .deleteFrom('OAuthAPICode')
    .where('id', '=', code)
    .where('clientId', '=', clientId)
    .returning(['userId', 'expiresAt', 'redirectUri'])
    .executeTakeFirst()

  if (!oauthCode) {
    res.writeStatus('400').end('Invalid or expired code')
    return
  }

  if (new Date(oauthCode.expiresAt) < new Date()) {
    res.writeStatus('400').end('Code expired')
    return
  }

  if (oauthCode.redirectUri !== expectedRedirectUri) {
    res.writeStatus('400').end('Redirect URI mismatch')
    return
  }

  const {userId} = oauthCode
  const user = await pg.selectFrom('User').select('tms').where('id', '=', userId).executeTakeFirst()
  const tms = user?.tms ?? []

  const authToken = encodeAuthToken(
    new AuthToken({
      sub: userId,
      tms,
      scope: ['graphql:persisted'],
      lifespan_ms: ms('30d'),
      aud: 'action-oauth2'
    })
  )

  // Safely embed data as JSON — authToken is a JWT (base64url + dots only)
  const payload = JSON.stringify({authToken, nonce})
  const safeOrigin = JSON.stringify(openerOrigin)

  const html = `<!DOCTYPE html>
<html>
<head><title>Parabol Login</title></head>
<body>
<script>
if (window.opener) {
  window.opener.postMessage(${payload}, ${safeOrigin});
  window.close();
} else {
  document.body.textContent = 'Login successful. You may close this window.';
}
</script>
</body>
</html>`

  res.writeStatus('200').writeHeader('Content-Type', 'text/html').end(html)
})

export default mattermostOAuthCallbackHandler
