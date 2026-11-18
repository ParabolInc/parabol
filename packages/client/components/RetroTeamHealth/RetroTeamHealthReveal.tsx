import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthReveal_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthReveal_teamHealthMeeting.graphql'
import useEndTeamHealthMutation from '../../mutations/useEndTeamHealthMutation'
import {Button} from '../../ui/Button/Button'
import TeamHealthRevealDialog from '../TeamHealth/TeamHealthRevealDialog'

interface Props {
  teamHealthMeeting: RetroTeamHealthReveal_teamHealthMeeting$key
  isStartedHere: boolean
  pendingCount: number
  onRevealed: () => void
}

// revealing ends the check for the whole team, so here it waits until nobody is left to answer. A
// check this retro started reveals when the retro ends anyway, so it can go early behind a warning
const RetroTeamHealthReveal = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, isStartedHere, pendingCount, onRevealed} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthReveal_teamHealthMeeting on TeamHealthMeeting {
        id
      }
    `,
    teamHealthMeetingRef
  )
  const [endTeamHealth, revealing] = useEndTeamHealthMutation()
  const [isConfirming, setIsConfirming] = useState(false)
  if (pendingCount > 0 && !isStartedHere) return null
  const reveal = () => {
    endTeamHealth({variables: {meetingId: teamHealthMeeting.id}, onCompleted: onRevealed})
  }
  const isEveryoneIn = pendingCount === 0
  return (
    <>
      <Button
        variant={isEveryoneIn ? 'primary' : 'outline'}
        shape='default'
        size='lg'
        className='mt-7'
        disabled={revealing}
        onClick={isEveryoneIn ? reveal : () => setIsConfirming(true)}
      >
        Reveal results
      </Button>
      <span className='mt-3 max-w-sm text-balance text-fg-muted text-sm'>
        Ends the check and opens Health Results, one category at a time.
      </span>
      <TeamHealthRevealDialog
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={reveal}
        submitting={revealing}
        pendingCount={pendingCount}
      />
    </>
  )
}

export default RetroTeamHealthReveal
