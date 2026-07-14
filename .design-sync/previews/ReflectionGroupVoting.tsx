import {ReflectionGroupVoting} from 'parabol-client'

// Identity Relay stub: pass fragment $data objects directly as the refs.
const meeting = (votesRemaining: number, maxVotesPerGroup = 3) => ({
  id: 'meeting1',
  localStage: {isComplete: false},
  viewerMeetingMember: {votesRemaining},
  maxVotesPerGroup
})

export const CollapsedWithVotes = () => (
  <div className='w-28 rounded-lg bg-white p-2 shadow'>
    <ReflectionGroupVoting
      isExpanded={false}
      meeting={meeting(2)}
      reflectionGroup={{id: 'group1', viewerVoteCount: 2}}
    />
  </div>
)

export const NoVotesYet = () => (
  <div className='w-28 rounded-lg bg-white p-2 shadow'>
    <ReflectionGroupVoting
      isExpanded={false}
      meeting={meeting(3)}
      reflectionGroup={{id: 'group2', viewerVoteCount: 0}}
    />
  </div>
)

export const Expanded = () => (
  <div className='w-28 rounded-lg bg-slate-700 p-2'>
    <ReflectionGroupVoting
      isExpanded={true}
      meeting={meeting(1)}
      reflectionGroup={{id: 'group3', viewerVoteCount: 4}}
    />
  </div>
)
