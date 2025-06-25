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
      return botId as string
    } catch (err) {
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
      const response = await axios.get(`${RECALL_API_BASE_URL}/bot/${botId}`, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const bot = response.data
      const recordings = bot.recordings || []

      if (recordings.length === 0) {
        return []
      }

      const recording = recordings[0]
      const mediaShortcuts = recording.media_shortcuts || {}
      const transcriptData = mediaShortcuts.transcript?.data

      if (!transcriptData?.download_url) {
        return []
      }

      console.log('🚀 ~ transcriptData:', transcriptData)
      const transcriptResponse = await axios.get(transcriptData.download_url)
      const data: TranscriptResponse[] = transcriptResponse.data

      // Convert API response to our transcript format
      const transcript: TranscriptBlock[] = data.map((block) => ({
        speaker: block.participant.name || `Participant ${block.participant.id}`,
        words: block.words.map((word) => word.text).join(' ')
      }))

      return transcript
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error(`Unable to get bot transcript with botId: ${botId}`)
      sendToSentry(error)
      return
    }
  }
}

export default RecallAIServerManager
