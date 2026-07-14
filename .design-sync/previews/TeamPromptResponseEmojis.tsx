import {TeamPromptResponseEmojis} from 'parabol-client'

// Identity Relay stub: responseRef is the fragment $data. Reactji ids are
// `reactableId:emojiName` where emojiName is a valid emoji-mart shortcode.
const reactji = (name: string, count: number, isViewerReactji = false) => ({
  id: `resp1:${name}`,
  count,
  isViewerReactji
})

export const WithReactions = () => (
  <div className='w-96 rounded-card bg-white p-4 shadow-card'>
    <div className='text-slate-700 text-sm'>Shipped the new onboarding flow this sprint.</div>
    <TeamPromptResponseEmojis
      meetingId='meeting1'
      responseRef={{
        id: 'resp1',
        reactjis: [reactji('tada', 3, true), reactji('heart', 2), reactji('fire', 1)]
      }}
    />
  </div>
)

export const SingleReaction = () => (
  <div className='w-96 rounded-card bg-white p-4 shadow-card'>
    <div className='text-slate-700 text-sm'>Paired on the tricky data migration.</div>
    <TeamPromptResponseEmojis
      meetingId='meeting1'
      responseRef={{id: 'resp2', reactjis: [reactji('rocket', 4, true)]}}
    />
  </div>
)
