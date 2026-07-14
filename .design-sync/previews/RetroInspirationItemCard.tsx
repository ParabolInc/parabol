import {RetroInspirationItemCard} from 'parabol-client'

const doc = (text: string) => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

export const Reflection = () => (
  <div className='w-80'>
    <RetroInspirationItemCard
      meetingId='meeting-1'
      promptId='prompt-1'
      title='Jira · SPRINT-204'
      content={doc(
        'The deploy pipeline was flaky all week — we lost about a day to reruns and manual retries.'
      )}
    />
  </div>
)
