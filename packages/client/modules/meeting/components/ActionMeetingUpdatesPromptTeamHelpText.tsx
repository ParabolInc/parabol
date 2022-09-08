import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'
import {ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember} from '../../../__generated__/ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember.graphql'

const AgendaControl = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
})

interface Props {
  currentMeetingMember: ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember
}

const ActionMeetingUpdatesPromptTeamHelpText = (props: Props) => {
  const {currentMeetingMember} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const handleAgendaControl = () => {
    atmosphere.eventEmitter.emit('focusAgendaInput')
  }
  const {teamMember, user} = currentMeetingMember
  const {isConnected} = user
  const {preferredName} = teamMember
  return (
    <span>
      <span>
        {isConnected === false
          ? '('
          : t('ActionMeetingUpdatesPromptTeamHelpText.PreferredNameIsSharing', {
              preferredName
            })}
      </span>
      <AgendaControl onClick={handleAgendaControl}>
        {t('ActionMeetingUpdatesPromptTeamHelpText.AddAgendaItems')}
      </AgendaControl>
      {t('ActionMeetingUpdatesPromptTeamHelpText.ForDiscussion')}
    </span>
  )
}

export default createFragmentContainer(ActionMeetingUpdatesPromptTeamHelpText, {
  currentMeetingMember: graphql`
    fragment ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember on ActionMeetingMember {
      user {
        isConnected
      }
      teamMember {
        preferredName
      }
    }
  `
})
