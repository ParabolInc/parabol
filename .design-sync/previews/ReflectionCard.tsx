import {ReflectionCard} from 'parabol-client'

// Identity Relay stub: pass fragment $data directly. `content` is a TipTap doc
// JSON string (the card renders it through a read-only TipTap editor).
const doc = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{type: 'paragraph', content: [{type: 'text', text}]}]
  })

const reactji = (name: string, count: number, isViewerReactji = false) => ({
  id: `ref1:${name}`,
  count,
  isViewerReactji
})

const reflection = (text: string, groupColor: string, question: string) => ({
  isViewerCreator: false,
  id: 'ref1',
  isEditing: false,
  meetingId: 'meeting1',
  reflectionGroupId: 'group1',
  promptId: 'prompt1',
  content: doc(text),
  reactjis: [reactji('tada', 2), reactji('heart', 1, true)],
  sortOrder: 0,
  creator: {preferredName: 'Jordan Husney'},
  prompt: {question, groupColor}
})

const meeting = {
  id: 'meeting1',
  localPhase: {phaseType: 'discuss'},
  localStage: {isComplete: true},
  phases: [{phaseType: 'discuss', stages: [{id: 's1', isComplete: true}]}],
  spotlightGroup: null,
  disableAnonymity: true,
  spotlightSearchQuery: '',
  teamId: 'team1'
}

export const Default = () => (
  <div className='w-72'>
    <ReflectionCard
      showReactji
      meetingRef={meeting}
      reflectionRef={reflection(
        'Shipped the new onboarding flow ahead of schedule.',
        '#66B04E',
        'What went well?'
      )}
    />
  </div>
)

export const StopColumn = () => (
  <div className='w-72'>
    <ReflectionCard
      showReactji
      meetingRef={meeting}
      reflectionRef={reflection(
        'CI was flaky all week and slowed down every merge.',
        '#E55C5C',
        'What should we stop?'
      )}
    />
  </div>
)
