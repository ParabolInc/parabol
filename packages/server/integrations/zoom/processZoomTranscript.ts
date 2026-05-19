import {generateJSON} from '@tiptap/html'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TranscriptPageInput} from '../gdrive/attachTranscriptToSummaryPage'

type VttCue = {
  speaker: string
  text: string
}

const parseVtt = (vtt: string): VttCue[] => {
  const cues: VttCue[] = []
  // Split on blank lines to get cue blocks
  const blocks = vtt.split(/\n\s*\n/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    // Skip WEBVTT header and non-cue blocks
    if (lines.length < 2) continue
    // Find the timestamp line (contains -->)
    const tsIdx = lines.findIndex((l) => l.includes('-->'))
    if (tsIdx === -1) continue
    // Text is everything after the timestamp
    const textLines = lines
      .slice(tsIdx + 1)
      .join(' ')
      .trim()
    if (!textLines) continue

    // Zoom VTT may use <v Speaker> tag or "Speaker: text" format
    const vTagMatch = textLines.match(/^<v ([^>]+)>(.*)$/)
    if (vTagMatch) {
      cues.push({speaker: vTagMatch[1]!.trim(), text: vTagMatch[2]!.trim()})
      continue
    }
    // "Speaker Name: text" format
    const colonMatch = textLines.match(/^([^:]{1,60}):\s+(.+)$/)
    if (colonMatch) {
      cues.push({speaker: colonMatch[1]!.trim(), text: colonMatch[2]!.trim()})
      continue
    }
    // No speaker detected — use empty string
    cues.push({speaker: '', text: textLines})
  }
  return cues
}

const cuesToHtml = (cues: VttCue[]): string => {
  const parts: string[] = []
  let currentSpeaker = ''
  let buffer: string[] = []

  const flush = () => {
    if (buffer.length === 0) return
    const speakerLabel = currentSpeaker ? `<strong>${currentSpeaker}:</strong> ` : ''
    parts.push(`<p>${speakerLabel}${buffer.join(' ')}</p>`)
    buffer = []
  }

  for (const {speaker, text} of cues) {
    if (speaker !== currentSpeaker) {
      flush()
      currentSpeaker = speaker
    }
    buffer.push(text)
  }
  flush()
  return parts.join('')
}

export const processZoomTranscript = (vtt: string): TranscriptPageInput[] => {
  const cues = parseVtt(vtt)
  if (cues.length === 0) return []
  const html = cuesToHtml(cues)
  const content = generateJSON(
    `<h1>Zoom Transcript</h1>${html}`,
    serverTipTapExtensions
  ) as TipTapSerializedPageContent
  return [{title: 'Zoom Transcript', content}]
}
