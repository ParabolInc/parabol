import {RetroDiscussPhase_meeting$data} from '../__generated__/RetroDiscussPhase_meeting.graphql'

export type TranscriptBlock = {
  speaker: string
  words: string
}

interface Props {
  transcription: NonNullable<RetroDiscussPhase_meeting$data['transcription']>
}

const Transcription = (props: Props) => {
  const {transcription} = props

  const validTranscriptionBlocks = transcription.filter(
    (block): block is TranscriptBlock => block !== null
  )
  return (
    <div className='flex h-full flex-col overflow-auto px-6 py-2 text-sm'>
      {validTranscriptionBlocks.map((block, idx) => (
        <div key={idx} className='my-2'>
          <div className='font-semibold text-slate-700'>{block.speaker}</div>
          <div className='text-slate-800'>{block.words}</div>
        </div>
      ))}
    </div>
  )
}

export default Transcription
