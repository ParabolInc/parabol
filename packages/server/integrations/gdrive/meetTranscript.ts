import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {generateJSON} from '../../utils/tiptap/generateJSON'

export type MeetEntry = {participant?: string; text?: string; startTime?: string}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const processMeetTranscript = (
  entries: MeetEntry[],
  names: Record<string, string>
): TipTapSerializedPageContent | null => {
  const clean = entries.filter((e) => (e.text ?? '').trim().length > 0)
  if (clean.length === 0) return null
  const parts: string[] = []
  let currentSpeaker: string | undefined
  let buffer: string[] = []
  const flush = () => {
    if (buffer.length === 0) return
    const name = currentSpeaker ? names[currentSpeaker] : undefined
    const label = name ? `<strong>${escapeHtml(name)}:</strong> ` : ''
    parts.push(`<p>${label}${escapeHtml(buffer.join(' '))}</p>`)
    buffer = []
  }
  for (const {participant, text} of clean) {
    if (participant !== currentSpeaker) {
      flush()
      currentSpeaker = participant
    }
    buffer.push((text ?? '').trim())
  }
  flush()
  return generateJSON(
    `<h1>Transcript</h1>${parts.join('')}`,
    serverTipTapExtensions
  ) as TipTapSerializedPageContent
}

const MEET_BASE = 'https://meet.googleapis.com/v2/'
// keep in sync with MATCH_WINDOW_MS in matchExternalMeetingToMeeting
const CORRELATION_WINDOW_MS = 60 * 60 * 1000

type ConfRecord = {name: string; endTime?: string}
type Transcript = {name: string; state?: string; docsDestination?: {document?: string}}
type Participant = {name: string; signedinUser?: {displayName?: string}}
type MeetResponse = {
  conferenceRecords?: ConfRecord[]
  transcripts?: Transcript[]
  transcriptEntries?: MeetEntry[]
  participants?: Participant[]
  nextPageToken?: string
}

const meetGet = async (fetchImpl: typeof fetch, accessToken: string, path: string) => {
  const res = await fetchImpl(MEET_BASE + path, {
    headers: {Authorization: `Bearer ${accessToken}`}
  })
  if (!res.ok) {
    throw Object.assign(new Error(`Meet API ${path} -> ${res.status}`), {status: res.status})
  }
  return res.json() as Promise<MeetResponse>
}

export const isPermanentMeetApiError = (e: unknown) => {
  if (typeof e !== 'object' || e === null) return false
  const {status} = e as {status?: unknown}
  return status === 403 || status === 404
}

export const fetchMeetTranscript = async (
  accessToken: string,
  docId: string,
  aroundTime: Date,
  deps?: {fetchImpl?: typeof fetch}
): Promise<TipTapSerializedPageContent | null> => {
  const fetchImpl = deps?.fetchImpl ?? fetch
  const lo = new Date(aroundTime.getTime() - CORRELATION_WINDOW_MS).toISOString()
  const hi = new Date(aroundTime.getTime() + CORRELATION_WINDOW_MS).toISOString()
  const filter = encodeURIComponent(`end_time>="${lo}" AND end_time<="${hi}"`)
  const {conferenceRecords = []} = await meetGet(
    fetchImpl,
    accessToken,
    `conferenceRecords?filter=${filter}`
  )
  const target = aroundTime.getTime()
  const byProximity = [...conferenceRecords].sort(
    (a, b) =>
      Math.abs(new Date(a.endTime ?? 0).getTime() - target) -
      Math.abs(new Date(b.endTime ?? 0).getTime() - target)
  )
  for (const record of byProximity) {
    const {transcripts = []} = await meetGet(fetchImpl, accessToken, `${record.name}/transcripts`)
    const ready = transcripts.find(
      (t) => t.state === 'FILE_GENERATED' && t.docsDestination?.document === docId
    )
    if (!ready) continue

    const entries: MeetEntry[] = []
    let pageToken: string | undefined
    do {
      const q = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ''
      const data = await meetGet(fetchImpl, accessToken, `${ready.name}/entries${q}`)
      entries.push(...(data.transcriptEntries ?? []))
      pageToken = data.nextPageToken
    } while (pageToken)

    const {participants = []} = await meetGet(fetchImpl, accessToken, `${record.name}/participants`)
    const names: Record<string, string> = {}
    for (const p of participants) {
      if (p.signedinUser?.displayName) names[p.name] = p.signedinUser.displayName
    }
    return processMeetTranscript(entries, names)
  }
  return null
}
