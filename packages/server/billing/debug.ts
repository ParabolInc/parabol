// call with pnpm sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'
import {google} from 'googleapis'

// ── credentials ──────────────────────────────────────────────────────────────
// Grab these from your DB:
//   SELECT "accessToken", "refreshToken" FROM "TeamMemberIntegrationAuth"
//   WHERE service = 'gdrive' LIMIT 1;
const ACCESS_TOKEN = ''
const REFRESH_TOKEN = ''
const folderId = '1R9LKKqCNVbn0avlnRXmr2qx5beh6JonW'

// ─────────────────────────────────────────────────────────────────────────────

const doDebugStuff = async () => {
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!CLIENT_ID || !CLIENT_SECRET)
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET')

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
  oauth2Client.setCredentials({access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN})
  const drive = google.drive({version: 'v3', auth: oauth2Client})

  const filesRes = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    orderBy: 'createdTime desc',
    pageSize: 1,
    fields: 'files(id, name, mimeType, createdTime)'
  })

  const file = filesRes.data.files?.[0]
  if (!file?.id) {
    console.log('No files found')
    return
  }

  console.log(`File: ${file.name} (${file.id})`)
  console.log(`Type: ${file.mimeType}`)

  const mdRes = await drive.files.export({fileId: file.id, mimeType: 'text/markdown'})
  const markdown = mdRes.data as string
  console.log(`\nMarkdown (${markdown.length} chars):\n`)
  console.log(markdown)
}

doDebugStuff().catch(console.error)
