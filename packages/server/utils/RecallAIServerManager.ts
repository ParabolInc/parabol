import api from 'api'

const sdk = api('@recallai/v1.6#536jnqlf7d6blh')

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
          destination_url: 'http://localhost:3000/meetings'
        },
        automatic_video_output: {in_call_recording: {kind: 'jpeg', b64_data: 'SGVsbG8gV29ybGQh'}},
        recording_mode: 'speaker_view',
        meeting_url: videoMeetingURL
      })
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  }
}

export default RecallAIServerManager
