import {SuggestedActionTryActionMeeting_suggestedAction} from '__generated__/SuggestedActionTryActionMeeting_suggestedAction.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV2'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{}> {
  suggestedAction: SuggestedActionTryActionMeeting_suggestedAction
}

class SuggestedActionTryActionMeeting extends Component<Props> {
  onClick = () => {
    const {history, suggestedAction} = this.props
    const {team} = suggestedAction
    const {id: teamId} = team
    history.push(`/meeting/${teamId}`)
  }

  render () {
    const {suggestedAction} = this.props
    const {id: suggestedActionId, team} = suggestedAction
    const {name: teamName} = team
    return (
      <SuggestedActionCard
        backgroundColor={PALETTE.BACKGROUND_TEAL}
        iconName='change_history'
        suggestedActionId={suggestedActionId}
      >
        <SuggestedActionCopy>Hold your first Action Meeting with {teamName}</SuggestedActionCopy>
        <SuggestedActionButton onClick={this.onClick}>Start Action Meeting</SuggestedActionButton>
      </SuggestedActionCard>
    )
  }
}

export default createFragmentContainer(
  withRouter(SuggestedActionTryActionMeeting),
  graphql`
    fragment SuggestedActionTryActionMeeting_suggestedAction on SuggestedActionTryActionMeeting {
      id
      team {
        id
        name
      }
    }
  `
)
