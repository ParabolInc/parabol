import type {meet_v2} from 'googleapis'
import ms from 'ms'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {getMeetClient} from './getMeetClient'
import {processMeetTranscript} from './processMeetTranscript'

// A Meet call routinely starts before the Parabol meeting and runs on after it, so candidates are
// pulled from a generous window and then ranked by how much they actually overlap
const CONFERENCE_LOOKBACK = ms('2h')
// The transcript resource is created when transcription STARTS, so it already exists while the
// call is running. This is a read-consistency buffer, not a budget for generating anything: if
// there's still no resource this long after the call ended, transcription was never turned on
const NO_TRANSCRIPT_GRACE = ms('10m')
// FILE_GENERATED is the only signal that the speech-recognition pipeline finished. ENDED just
// means the session stopped, and reading entries then risks a silently truncated transcript.
// If the file never generates, settle for whatever entries exist rather than losing the transcript
const FILE_GENERATION_WAIT = ms('30m')
const ENTRIES_PAGE_SIZE = 100

export type MeetTranscriptResult =
  | {status: 'ready'; transcriptName: string; content: TipTapSerializedPageContent}
  // conferenceRecords.list only returns conferences this user attended, so a member who skipped
  // the call sees nothing. Says nothing about the conference — ask the next member
  | {status: 'not-visible'}
  // this member can see the conference and it isn't done yet. Authoritative: no other member
  // can see further ahead, so there is no point asking them
  | {status: 'pending'}
  // transcription was off, or nothing was said. Never going to arrive
  | {status: 'unavailable'}

const findOverlappingConference = (
  conferences: meet_v2.Schema$ConferenceRecord[],
  startedAt: Date,
  endedAt: Date
) => {
  let best: {record: meet_v2.Schema$ConferenceRecord; overlap: number} | null = null
  for (const record of conferences) {
    if (!record.startTime) continue
    const conferenceStart = new Date(record.startTime).getTime()
    // an unset endTime means the conference is still running, so it overlaps through to now
    const conferenceEnd = record.endTime ? new Date(record.endTime).getTime() : Date.now()
    const overlap =
      Math.min(conferenceEnd, endedAt.getTime()) - Math.max(conferenceStart, startedAt.getTime())
    if (overlap <= 0) continue
    if (!best || overlap > best.overlap) best = {record, overlap}
  }
  return best?.record ?? null
}

const listAllEntries = async (meet: meet_v2.Meet, transcriptName: string) => {
  const entries: meet_v2.Schema$TranscriptEntry[] = []
  let pageToken: string | undefined
  do {
    const res = await meet.conferenceRecords.transcripts.entries.list({
      parent: transcriptName,
      pageSize: ENTRIES_PAGE_SIZE,
      pageToken
    })
    entries.push(...(res.data.transcriptEntries ?? []))
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken)
  return entries
}

const getSpeakerNames = async (meet: meet_v2.Meet, conferenceName: string) => {
  const speakerByParticipant = new Map<string, string>()
  const res = await meet.conferenceRecords.participants.list({parent: conferenceName})
  for (const participant of res.data.participants ?? []) {
    const {name, signedinUser, anonymousUser, phoneUser} = participant
    if (!name) continue
    const displayName =
      signedinUser?.displayName ?? anonymousUser?.displayName ?? phoneUser?.displayName
    if (displayName) speakerByParticipant.set(name, displayName)
  }
  return speakerByParticipant
}

export const fetchMeetTranscript = async (
  gdriveAuth: TeamMemberIntegrationAuth,
  startedAt: Date,
  endedAt: Date
): Promise<MeetTranscriptResult> => {
  const meet = getMeetClient(gdriveAuth)

  const windowStart = new Date(startedAt.getTime() - CONFERENCE_LOOKBACK).toISOString()
  const windowEnd = endedAt.toISOString()
  const conferencesRes = await meet.conferenceRecords.list({
    filter: `start_time>="${windowStart}" AND start_time<="${windowEnd}"`,
    pageSize: 25
  })

  const conference = findOverlappingConference(
    conferencesRes.data.conferenceRecords ?? [],
    startedAt,
    endedAt
  )
  // the conference record can lag the call by a little, so no match yet isn't yet a no
  if (!conference?.name) return {status: 'not-visible'}
  // the call is still going. Nothing is final until it ends
  if (!conference.endTime) return {status: 'pending'}

  const transcriptsRes = await meet.conferenceRecords.transcripts.list({parent: conference.name})
  const transcript = transcriptsRes.data.transcripts?.[0]
  if (!transcript?.name) {
    const endedMsAgo = Date.now() - new Date(conference.endTime).getTime()
    return endedMsAgo > NO_TRANSCRIPT_GRACE ? {status: 'unavailable'} : {status: 'pending'}
  }
  if (transcript.state !== 'ENDED' && transcript.state !== 'FILE_GENERATED') {
    return {status: 'pending'}
  }
  if (transcript.state === 'ENDED' && transcript.endTime) {
    const endedMsAgo = Date.now() - new Date(transcript.endTime).getTime()
    if (endedMsAgo < FILE_GENERATION_WAIT) return {status: 'pending'}
  }

  const [entries, speakerByParticipant] = await Promise.all([
    listAllEntries(meet, transcript.name),
    getSpeakerNames(meet, conference.name)
  ])
  const content = processMeetTranscript(entries, speakerByParticipant, transcript.startTime)
  if (!content) return {status: 'unavailable'}
  return {status: 'ready', transcriptName: transcript.name, content}
}
