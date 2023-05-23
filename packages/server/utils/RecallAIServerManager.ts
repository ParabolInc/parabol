import api from 'api'
import axios from 'axios'
import {ExternalLinks} from '../../client/types/constEnums'

const sdk = api('@recallai/v1.6#536jnqlf7d6blh')

type TranscriptBlock = {
  speaker: string
  words: TranscriptWord[]
}

type TranscriptWord = {
  text: string
}

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
    console.error(error)
    return null
  }
}

class RecallAIServerManager {
  constructor() {
    sdk.auth(`Token ${process.env.RECALL_AI_KEY}`)
  }

  async createBot(videoMeetingURL: string) {
    try {
      const base64Image = await getBase64Image()
      if (!base64Image) return null

      const PROTOCOL = process.env.GRAPHQL_PROTOCOL || 'http'
      const HOST = process.env.GRAPHQL_HOST || 'localhost:3000'
      const {data} = await sdk.bot_create({
        bot_name: 'Parabol Notetaker',
        real_time_transcription: {
          partial_results: false,
          destination_url: `${PROTOCOL}://${HOST}` // this is required by the API but it's not doing anything and can be any URL. TODO: speak with recall.ai about this & fix
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
      console.error(err)
      return null
    }
  }

  async getBotTranscript(botId: string) {
    try {
      const {data} = await sdk.bot_transcript_list({
        enhanced_diarization: 'true',
        id: botId
      })
      const transcript = data.map((block: TranscriptBlock) => {
        const {speaker, words} = block
        const text = words.map((word) => word.text).join(' ')
        return `${speaker}: ${text}`
      })
      return transcript.join('\n') as string
    } catch (err) {
      console.error(err)
      return
    }
  }
}

export default RecallAIServerManager
