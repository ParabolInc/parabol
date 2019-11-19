/**
 * Displays the calls to action at the top of the team dashboard.
 *
 */
import {TeamCallsToAction_team} from '../../../../__generated__/TeamCallsToAction_team.graphql'
import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useRouter from '../../../../hooks/useRouter'
import lazyPreload from '../../../../utils/lazyPreload'
import {Gutters} from '../../../../types/constEnums'
import {meetingTypeToLabel} from '../../../../utils/meetings/lookups'

interface Props {
  team: TeamCallsToAction_team
}

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: 224,
  paddingLeft: Gutters.DASH_GUTTER
})

const StartButton = styled(PrimaryButton)({
  width: '100%'
})

const TeamCallsToActionMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamCallsToActionMenu' */
    './TeamCallsToActionMenu'
  )
)

const TeamCallToAction = (props: Props) => {
  const {team} = props
  const {id: teamId, activeMeetings} = team
  const {
    togglePortal,
    originRef,
    menuPortal,
    menuProps,
    loadingWidth
  } = useMenu(MenuPosition.UPPER_RIGHT, {isDropdown: true})
  const [firstActiveMeeting] = activeMeetings
  const {history} = useRouter()
  const label = firstActiveMeeting && meetingTypeToLabel[firstActiveMeeting.meetingType]
  const goToMeeting = () => {
    const {id: meetingId} = firstActiveMeeting
    history.push(`/meet/${meetingId}/`)
  }
  return (
    <ButtonBlock>
      {firstActiveMeeting ? (
        <StartButton onClick={goToMeeting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Join ${label} Meeting`} />
        </StartButton>
      ) : (
        <>
          <StartButton
            onClick={togglePortal}
            onMouseEnter={TeamCallsToActionMenu.preload}
            ref={originRef}
          >
            <IconLabel icon='expand_more' iconAfter label='Start Meeting' />
          </StartButton>
          {menuPortal(
            <TeamCallsToActionMenu menuProps={menuProps} teamId={teamId} minWidth={loadingWidth} />
          )}
        </>
      )}
    </ButtonBlock>
  )
}

export default createFragmentContainer(TeamCallToAction, {
  team: graphql`
    fragment TeamCallsToAction_team on Team {
      id
      activeMeetings {
        id
        meetingType
      }
    }
  `
})
