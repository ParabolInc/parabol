import type {meet_v2} from 'googleapis'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {generateJSON} from '../../utils/tiptap/generateJSON'

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Offsets from the start of transcription read better than wall-clock times, which would need a
// timezone to mean anything to the reader
const formatOffset = (entryStart: string, baseMs: number) => {
  const offsetMs = new Date(entryStart).getTime() - baseMs
  if (!Number.isFinite(offsetMs) || offsetMs < 0) return null
  const totalSeconds = Math.floor(offsetMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  if (!hours) return `${minutes}:${seconds}`
  return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
}

// Entries arrive one utterance at a time, so consecutive entries from the same speaker are
// merged into a single paragraph to keep the page readable
const entriesToHtml = (
  entries: meet_v2.Schema$TranscriptEntry[],
  speakerByParticipant: Map<string, string>,
  baseMs: number
) => {
  const parts: string[] = []
  let currentSpeaker: string | undefined
  let runStart: string | null = null
  let buffer: string[] = []

  const flush = () => {
    if (buffer.length === 0) return
    // the run is stamped where the speaker took over, not at every utterance
    const offset = runStart ? formatOffset(runStart, baseMs) : null
    const stamp = offset ? `<strong>${offset}</strong> ` : ''
    const label = currentSpeaker ? `<strong>${escapeHtml(currentSpeaker)}:</strong> ` : ''
    parts.push(`<p>${stamp}${label}${escapeHtml(buffer.join(' '))}</p>`)
    buffer = []
  }

  for (const entry of entries) {
    const text = entry.text?.trim()
    if (!text) continue
    const speaker = entry.participant ? speakerByParticipant.get(entry.participant) : undefined
    if (speaker !== currentSpeaker) {
      flush()
      currentSpeaker = speaker
      runStart = entry.startTime ?? null
    }
    buffer.push(text)
  }
  flush()
  return parts.join('')
}

export const processMeetTranscript = (
  entries: meet_v2.Schema$TranscriptEntry[],
  speakerByParticipant: Map<string, string>,
  transcriptStart: string | null | undefined
) => {
  const base = transcriptStart ?? entries.find(({startTime}) => startTime)?.startTime
  const baseMs = base ? new Date(base).getTime() : Number.NaN
  const html = entriesToHtml(entries, speakerByParticipant, baseMs)
  if (!html) return null
  return generateJSON(
    `<h1>Google Meet Transcript</h1>${html}`,
    serverTipTapExtensions
  ) as TipTapSerializedPageContent
}
