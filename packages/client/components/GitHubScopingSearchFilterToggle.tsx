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
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const FilterIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const GitHubScopingSearchFilterMenuRoot = lazyPreload(() =>
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
      <PlainButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </PlainButton>
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
