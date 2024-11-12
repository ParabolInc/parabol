import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {SuggestedActionTryActionMeeting_suggestedAction$key} from '../__generated__/SuggestedActionTryActionMeeting_suggestedAction.graphql'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryActionMeeting_suggestedAction$key
}

const SuggestedActionTryActionMeeting = (props: Props) => {
  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionTryActionMeeting_suggestedAction on SuggestedActionTryActionMeeting {
        id
        team {
          id
          name
        }
      }
    `,
    suggestedActionRef
  )
  const {id: suggestedActionId, team} = suggestedAction
  const {name: teamName} = team

  const onClick = () => {
    const {history} = props
    history.push(`/activity-library/category/standup`)
  }

  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.AQUA_400}
      iconName='change_history'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>Hold your first Check-in Meeting with {teamName}</SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>Start Check-in Meeting</SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default withRouter(SuggestedActionTryActionMeeting)
