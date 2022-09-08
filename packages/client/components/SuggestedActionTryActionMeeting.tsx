import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {PALETTE} from '../styles/paletteV3'
import {SuggestedActionTryActionMeeting_suggestedAction} from '../__generated__/SuggestedActionTryActionMeeting_suggestedAction.graphql'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props extends RouteComponentProps<{[x: string]: string | undefined}> {
  suggestedAction: SuggestedActionTryActionMeeting_suggestedAction
}

const SuggestedActionTryActionMeeting = (props: Props) => {
  const {t} = useTranslation()

  const onClick = () => {
    const {history, suggestedAction} = props
    const {team} = suggestedAction
    const {id: teamId} = team
    history.push(
      t('SuggestedActionTryActionMeeting.NewMeetingTeamId', {
        teamId
      })
    )
  }

  const {suggestedAction} = props
  const {id: suggestedActionId, team} = suggestedAction
  const {name: teamName} = team
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.AQUA_400}
      iconName='change_history'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        {t('SuggestedActionTryActionMeeting.HoldYourFirstCheckInMeetingWith')}
        {teamName}
      </SuggestedActionCopy>
      <SuggestedActionButton onClick={onClick}>
        {t('SuggestedActionTryActionMeeting.StartCheckInMeeting')}
      </SuggestedActionButton>
    </SuggestedActionCard>
  )
}

export default createFragmentContainer(withRouter(SuggestedActionTryActionMeeting), {
  suggestedAction: graphql`
    fragment SuggestedActionTryActionMeeting_suggestedAction on SuggestedActionTryActionMeeting {
      id
      team {
        id
        name
      }
    }
  `
})
