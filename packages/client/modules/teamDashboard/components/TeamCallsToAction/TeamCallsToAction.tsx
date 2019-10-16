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
import {Breakpoint, Gutters} from '../../../../types/constEnums'
import {meetingTypeToLabel, meetingTypeToSlug} from '../../../../utils/meetings/lookups'

interface Props {
  team: TeamCallsToAction_team
}

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: 224,
  paddingLeft: Gutters.DASH_GUTTER_SMALL,

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    minWidth: 208,
    paddingLeft: Gutters.DASH_GUTTER_LARGE
  }
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
  const {id: teamId, newMeeting} = team
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {isDropdown: true}
  )
  const {history} = useRouter()
  const label = newMeeting && meetingTypeToLabel[newMeeting.meetingType]
  const slug = newMeeting && meetingTypeToSlug[newMeeting.meetingType]
  const goToMeeting = () => {
    history.push(`/${slug}/${teamId}/`)
  }
  return (
    <ButtonBlock>
      {newMeeting ? (
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
      newMeeting {
        meetingType
      }
    }
  `
})
