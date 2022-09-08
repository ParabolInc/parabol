import styled from '@emotion/styled'
import {Forum} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {PALETTE} from '~/styles/paletteV3'
import plural from '~/utils/plural'
import {NewMeetingActionsCurrentMeetings_team} from '~/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import FlatButton from './FlatButton'
import SelectMeetingDropdown from './SelectMeetingDropdown'

const CurrentButton = styled(FlatButton)<{hasMeetings: boolean}>(({hasMeetings}) => ({
  color: PALETTE.ROSE_500,
  fontSize: 16,
  fontWeight: 600,
  height: hasMeetings ? 50 : 0,
  visibility: hasMeetings ? undefined : 'hidden'
}))

const ForumIcon = styled(Forum)({
  marginRight: 12
})

interface Props {
  team: NewMeetingActionsCurrentMeetings_team
}

const NewMeetingActionsCurrentMeetings = (props: Props) => {
  const {team} = props

  const {t} = useTranslation()

  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.LOWER_RIGHT,
    {
      parentId: 'newMeetingRoot',
      isDropdown: true
    }
  )
  const {activeMeetings} = team
  useSnacksForNewMeetings(activeMeetings)
  const meetingCount = activeMeetings.length
  const label = t('NewMeetingActionsCurrentMeetings.MeetingCountActivePluralMeetingCountMeeting', {
    meetingCount,
    pluralMeetingCountMeeting: plural(meetingCount, 'Meeting')
  })
  return (
    <>
      <CurrentButton
        onClick={togglePortal}
        ref={originRef}
        hasMeetings={meetingCount > 0}
        size={t('NewMeetingActionsCurrentMeetings.Large')}
      >
        <ForumIcon />
        {label}
      </CurrentButton>
      {menuPortal(<SelectMeetingDropdown menuProps={menuProps} meetings={activeMeetings!} />)}
    </>
  )
}

export default createFragmentContainer(NewMeetingActionsCurrentMeetings, {
  team: graphql`
    fragment NewMeetingActionsCurrentMeetings_team on Team {
      id
      activeMeetings {
        ...SelectMeetingDropdown_meetings
        ...useSnacksForNewMeetings_meetings
        id
      }
    }
  `
})
