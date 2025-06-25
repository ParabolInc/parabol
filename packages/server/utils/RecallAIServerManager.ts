import axios from 'axios'
import {TranscriptBlock} from '../postgres/types'
import sendToSentry from './sendToSentry'

const RECALL_API_BASE_URL = 'https://us-west-2.recall.ai/api/v1'

type TranscriptResponse = {
  participant: {
    id: number
    name: string
  }
  words: {
    text: string
    start_timestamp?: any
    end_timestamp?: any
  }[]
}

class RecallAIServerManager {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RECALL_AI_KEY || ''
  }

  async createBot(videoMeetingURL: string) {
    try {
      const response = await axios.post(
        `${RECALL_API_BASE_URL}/bot`,
        {
          meeting_url: videoMeetingURL,
          bot_name: 'Parabol Notetaker',
          recording_config: {
            transcript: {
              provider: {
                meeting_captions: {}
              }
            }
          }
        },
        {
          headers: {
            Authorization: `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const {id: botId} = response.data
      console.log(`✅ Bot created successfully with ID: ${botId}`)
      console.log(`🤖 Full bot response:`, JSON.stringify(response.data, null, 2))
      return botId as string
    } catch (err) {
      console.log(`❌ Bot creation failed for URL: ${videoMeetingURL}`)
      console.log(`🚨 Bot creation error:`, err)

      const error =
        err instanceof Error
          ? err
          : new Error(`Unable to create Recall bot with video meeting URL: ${videoMeetingURL}`)
      sendToSentry(error)
      return null
    }
  }

  async getBotTranscript(botId: string): Promise<TranscriptBlock[] | undefined> {
    try {
      console.log(`🎯 Attempting to get transcript for bot: ${botId}`)
      const response = await axios.get(`${RECALL_API_BASE_URL}/bot/${botId}`, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`✅ Bot API response received`)
      console.log(`📝 Raw bot data:`, JSON.stringify(response.data, null, 2))

      // Extract transcript from media_shortcuts in the bot response
      const bot = response.data
      const recordings = bot.recordings || []

      if (recordings.length === 0) {
        console.log(`📝 No recordings found for bot ${botId}`)
        return []
      }

      // Get the first recording and check for transcript
      const recording = recordings[0]
      const mediaShortcuts = recording.media_shortcuts || {}
      const transcriptData = mediaShortcuts.transcript?.data

      if (!transcriptData) {
        console.log(`📝 No transcript data found in media shortcuts for bot ${botId}`)
        return []
      }

      // If there's a download URL, we need to fetch the transcript
      if (transcriptData.download_url) {
        console.log(`📥 Downloading transcript from: ${transcriptData.download_url}`)
        const transcriptResponse = await axios.get(transcriptData.download_url)
        const data: TranscriptResponse[] = transcriptResponse.data

        console.log(`📝 Downloaded transcript data:`, JSON.stringify(data, null, 2))

        const transcript: TranscriptBlock[] = []
        let currentBlock: TranscriptBlock | null = null

        data.forEach((block) => {
          const {participant, words} = block
          const speaker = participant.name || `Participant ${participant.id}`
          const currentWords = words.map((word) => word.text).join(' ')

          if (currentBlock && currentBlock.speaker === speaker) {
            currentBlock.words += '. ' + currentWords
          } else {
            if (currentBlock) {
              transcript.push(currentBlock)
            }
            currentBlock = {
              speaker,
              words: currentWords
            }
          }
        })

        if (currentBlock) {
          transcript.push(currentBlock)
        }

        console.log(`🎤 Processed transcript blocks:`, transcript.length)
        console.log(`📋 Final transcript:`, JSON.stringify(transcript, null, 2))

        return transcript
      }

      console.log(`📝 No transcript download URL available yet for bot ${botId}`)
      return []
    } catch (err) {
      console.log(`❌ Transcript error for bot ${botId}:`, err)

      // Check if it's a specific error type that indicates transcript not ready
      if (err && typeof err === 'object' && 'status' in err) {
        console.log(`🚨 Error status: ${(err as any).status}`)
        console.log(`🚨 Error message: ${(err as any).message}`)

        // Transcript might not be available yet - this is normal during active meetings
        if ((err as any).status === 400) {
          console.log(
            `⏳ Transcript not ready yet for bot ${botId} (400 error - normal during active meetings)`
          )
          // Return empty transcript if not ready yet
          return []
        }
      }

      const error =
        err instanceof Error ? err : new Error(`Unable to get bot transcript with botId: ${botId}`)
      sendToSentry(error)
      return
    }
  }
}

export default RecallAIServerManager
