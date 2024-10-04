import api from 'api'
import axios from 'axios'
import {ExternalLinks} from '../../client/types/constEnums'
import appOrigin from '../appOrigin'
import {TranscriptBlock} from '../postgres/types'
import {Logger} from './Logger'
import sendToSentry from './sendToSentry'

const sdk = api('@recallai/v1.6#536jnqlf7d6blh')

const getBase64Image = async () => {
  try {
    const imageUrl = ExternalLinks.LOGO
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'binary')
    const base64Image = buffer.toString('base64')
    return base64Image
  } catch (error) {
    Logger.error(error)
    return null
  }
}

type TranscriptResponse = {
  speaker: string
  words: {
    text: string
  }[]
}

class RecallAIServerManager {
  constructor() {
    sdk.auth(`Token ${process.env.RECALL_AI_KEY}`)
  }

  async createBot(videoMeetingURL: string) {
    try {
      const base64Image = await getBase64Image()
      if (!base64Image) return null

      const {data} = await sdk.bot_create({
        bot_name: 'Parabol Notetaker',
        real_time_transcription: {
          partial_results: false,
          destination_url: appOrigin // this is required by the API but it's not doing anything and can be any URL. TODO: speak with recall.ai about this & fix
        },
        transcription_options: {provider: 'assembly_ai'},
        chat: {
          on_bot_join: {send_to: 'everyone', message: 'Parabol Notetaker has joined the call'}
        },
        automatic_leave: {
          waiting_room_timeout: 1200,
          noone_joined_timeout: 1200,
          everyone_left_timeout: 2
        },
        automatic_video_output: {in_call_recording: {kind: 'jpeg', b64_data: base64Image}},
        recording_mode: 'speaker_view',
        recording_mode_options: {participant_video_when_screenshare: 'hide'},
        meeting_url: videoMeetingURL
      })
      const {id: botId} = data
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
      const {data}: {data: TranscriptResponse[]} = await sdk.bot_transcript_list({
        enhanced_diarization: 'true',
        id: botId
      })

      const transcript: TranscriptBlock[] = []
      let currentBlock: TranscriptBlock | null = null

      data.forEach((block) => {
        const {speaker, words} = block
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
