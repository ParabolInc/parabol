import '../../../scripts/webpack/utils/dotenv'
import {google} from 'googleapis'

// ── credentials ──────────────────────────────────────────────────────────────
// Grab these from your DB, then put them in .env:
//   SELECT "accessToken", "refreshToken" FROM "TeamMemberIntegrationAuth"
//   WHERE service = 'gdrive' LIMIT 1;
// The token must carry meetings.space.readonly — a drive.meet.readonly token 403s here.
const ACCESS_TOKEN = process.env.GDRIVE_DEBUG_ACCESS_TOKEN ?? ''
const REFRESH_TOKEN = process.env.GDRIVE_DEBUG_REFRESH_TOKEN ?? ''
const LOOKBACK_MS = 1000 * 60 * 60 * 24 * 7

// ─────────────────────────────────────────────────────────────────────────────

const describeError = (e: unknown) => {
  const err = e as {code?: number; status?: number; message?: string; response?: {data?: unknown}}
  return `${err.status ?? err.code ?? '?'} ${err.message ?? String(e)} ${JSON.stringify(err.response?.data ?? {})}`
}

const doDebugStuff = async () => {
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!CLIENT_ID || !CLIENT_SECRET)
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET')
  if (!ACCESS_TOKEN || !REFRESH_TOKEN)
    throw new Error('Missing GDRIVE_DEBUG_ACCESS_TOKEN / GDRIVE_DEBUG_REFRESH_TOKEN')

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
  oauth2Client.setCredentials({access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN})
  const meet = google.meet({version: 'v2', auth: oauth2Client})

  const tokenInfo = await oauth2Client.getTokenInfo(
    (await oauth2Client.getAccessToken()).token as string
  )
  console.log(`Granted scopes: ${tokenInfo.scopes.join(', ')}\n`)

  const windowStart = new Date(Date.now() - LOOKBACK_MS).toISOString()
  const conferencesRes = await meet.conferenceRecords.list({
    filter: `start_time>="${windowStart}"`,
    pageSize: 25
  })
  const conferences = conferencesRes.data.conferenceRecords ?? []
  console.log(`${conferences.length} conference record(s) in the last 7 days\n`)

  for (const conference of conferences) {
    if (!conference.name) continue
    console.log(`── ${conference.name}`)
    console.log(
      `   space=${conference.space} start=${conference.startTime} end=${conference.endTime ?? '(still live)'}`
    )
    if (!conference.endTime) {
      console.log('   still live — a transcript cannot be final yet\n')
      continue
    }

    try {
      const transcriptsRes = await meet.conferenceRecords.transcripts.list({
        parent: conference.name
      })
      const transcripts = transcriptsRes.data.transcripts ?? []
      if (transcripts.length === 0) {
        console.log('   no transcript — transcription was never turned on\n')
        continue
      }
      for (const transcript of transcripts) {
        console.log(`   transcript ${transcript.name} state=${transcript.state}`)
        if (!transcript.name) continue
        const entriesRes = await meet.conferenceRecords.transcripts.entries.list({
          parent: transcript.name,
          pageSize: 5
        })
        const entries = entriesRes.data.transcriptEntries ?? []
        console.log(`   first ${entries.length} entr(ies):`)
        for (const entry of entries) {
          console.log(`      [${entry.participant}] ${entry.text}`)
        }
      }
    } catch (e) {
      console.log(`   transcripts FAILED — ${describeError(e)}`)
    }
    console.log('')
  }
}

doDebugStuff().catch(console.error)
