import {PromptResponseEditor} from 'parabol-client'

const doc = (text: string) => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

export const Response = () => (
  <div className='w-96'>
    <PromptResponseEditor
      content={doc(
        'Shipped the new standup timeline view and paired with Maya on the drawer filters. Blocked on the staging deploy.'
      )}
      readOnly={true}
      teamId=''
    />
  </div>
)
