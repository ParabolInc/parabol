import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import Menu from '../components/Menu'
import MenuItem from '../components/MenuItem'
import MenuItemLabel from '../components/MenuItemLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import PromoteNewMeetingFacilitatorMutation from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {FacilitatorMenu_meeting} from '../__generated__/FacilitatorMenu_meeting.graphql'

interface Props {
  menuProps: MenuProps
  meeting: FacilitatorMenu_meeting
}

const FacilitatorMenu = (props: Props) => {
  const {menuProps, meeting} = props

  const {t} = useTranslation()

  const {id: meetingId, facilitatorUserId, meetingMembers} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const facilitatorCandidateIds = meetingMembers
    .filter(({user}) => user.id !== facilitatorUserId && user.isConnected)
    .map(({user}) => user.id)
  const promoteViewerToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
  }
  const promoteRandomPersonToFacilitator = () => {
    // ! here because we know that facilitatorCandidateIds.length >= 1 so newFacilitatorUserId is always defined
    const newFacilitatorId =
      facilitatorCandidateIds[Math.floor(Math.random() * facilitatorCandidateIds.length)]!
    PromoteNewMeetingFacilitatorMutation(atmosphere, {
      facilitatorUserId: newFacilitatorId,
      meetingId
    })
  }
  return (
    <Menu ariaLabel={t('FacilitatorMenu.ChangeTheFacilitatorRole')} {...menuProps}>
      {viewerId !== facilitatorUserId && (
        <MenuItem
          label={<MenuItemLabel>{t('FacilitatorMenu.TakeTheFacilitatorRole')}</MenuItemLabel>}
          onClick={promoteViewerToFacilitator}
        />
      )}
      {facilitatorCandidateIds.length >= 1 && (
        <MenuItem
          label={<MenuItemLabel>{t('FacilitatorMenu.RandomizeFacilitator')}</MenuItemLabel>}
          onClick={promoteRandomPersonToFacilitator}
        />
      )}
    </Menu>
  )
}

export default createFragmentContainer(FacilitatorMenu, {
  meeting: graphql`
    fragment FacilitatorMenu_meeting on NewMeeting {
      id
      facilitatorUserId
      meetingMembers {
        user {
          id
          isConnected
        }
      }
    }
  `
})
