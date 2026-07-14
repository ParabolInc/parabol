import {InspirationItemCard} from 'parabol-client'

const doc = (text: string) => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

export const LinkedIdea = () => (
  <div className='w-80'>
    <InspirationItemCard
      title='Notion · Q3 Planning'
      content={doc(
        'Finalize the onboarding redesign and share the Figma prototype with the team for feedback.'
      )}
      responsePlaintext=''
      onAddToResponse={() => {}}
    />
  </div>
)

export const Added = () => {
  const text = 'Reviewed the incident postmortem and filed three follow-up tasks.'
  return (
    <div className='w-80'>
      <InspirationItemCard
        title='GitHub · parabol/parabol'
        content={doc(text)}
        responsePlaintext={text}
        onAddToResponse={() => {}}
      />
    </div>
  )
}
