import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {SuggestedActionTryRetroMeeting_suggestedAction$key} from '../__generated__/SuggestedActionTryRetroMeeting_suggestedAction.graphql'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryRetroMeeting_suggestedAction$key
}

const SuggestedActionTryRetroMeeting = (props: Props) => {
  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionTryRetroMeeting_suggestedAction on SuggestedActionTryRetroMeeting {
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
    history.push(`/activity-library/category/retrospective`)
  }

  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.TOMATO_500}
      iconName='history'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>Hold your first Retro Meeting with {teamName}</SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>Start Retro Meeting</SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default withRouter(SuggestedActionTryRetroMeeting)
