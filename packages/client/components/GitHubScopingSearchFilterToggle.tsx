import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import lazyPreload from '../utils/lazyPreload'
import {GitHubScopingSearchFilterToggle_meeting$key} from '../__generated__/GitHubScopingSearchFilterToggle_meeting.graphql'
import FlatButton from './FlatButton'
import Icon from './Icon'

const StyledButton = styled(FlatButton)({
  height: 24,
  marginLeft: 4,
  padding: 0,
  width: 24,
  background: PALETTE.SKY_500,
  '&:hover': {
    background: PALETTE.SKY_500
  }
})

const FilterIcon = styled(Icon)({
  color: PALETTE.WHITE,
  fontSize: ICON_SIZE.MD18
})

const GitHubScopingSearchFilterMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'GitHubScopingSearchFilterMenuRoot' */ './GitHubScopingSearchFilterMenuRoot'
    )
)
interface Props {
  meetingRef: GitHubScopingSearchFilterToggle_meeting$key
}

const GitHubScopingSearchFilterToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchFilterToggle_meeting on PokerMeeting {
        ...GitHubScopingSearchFilterMenuRoot_meeting
        id
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <StyledButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </StyledButton>
      {menuPortal(
        <GitHubScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingRef={meeting}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default GitHubScopingSearchFilterToggle
