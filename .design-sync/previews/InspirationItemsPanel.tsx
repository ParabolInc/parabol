import {InspirationItemsPanel} from 'parabol-client'

const doc = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{type: 'paragraph', content: [{type: 'text', text}]}]
  })

export const Panel = () => (
  <div className='w-96'>
    <InspirationItemsPanel
      meetingId='meeting-1'
      service='github'
      searchQuery=''
      initialItems={[
        {
          id: 'item-1',
          title: 'GitHub · parabol/parabol',
          content: doc('Merged the standup drawer PR and reviewed two follow-ups.')
        },
        {
          id: 'item-2',
          title: 'Notion · Q3 Planning',
          content: doc('Drafted the onboarding redesign spec and shared it for feedback.')
        }
      ]}
    />
  </div>
)
