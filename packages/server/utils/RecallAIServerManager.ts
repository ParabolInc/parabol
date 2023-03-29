import api from 'api'

const sdk = api('@recallai/v1.6#536jnqlf7d6blh')

type TranscriptBlock = {
  speaker: string
  words: TranscriptWord[]
}

type TranscriptWord = {
  text: string
}

class RecallAIServerManager {
  constructor() {
    sdk.auth(`Token ${process.env.RECALL_AI_KEY}`)
  }

  async createBot(videoMeetingURL: string) {
    try {
      const {data} = await sdk.bot_create({
        bot_name: 'Parabol Notetaker',
        real_time_transcription: {
          partial_results: false,
          destination_url: 'http://localhost:3000' // this is required by the API but it's not doing anything and can be any URL. TODO: speak with recall.ai about this & fix
        },
        transcription_options: {provider: 'assembly_ai'},
        automatic_video_output: {in_call_recording: {kind: 'jpeg', b64_data: 'SGVsbG8gV29ybGQh'}}, // b64 data is for the bot img. It's also a required field, but can be any string I believe. TODO: speak with recall.ai about removing/changing this requirement
        recording_mode: 'speaker_view',
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
