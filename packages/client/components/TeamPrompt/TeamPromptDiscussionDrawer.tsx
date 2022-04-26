import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {TeamPromptDiscussionDrawer_meeting$key} from '~/__generated__/TeamPromptDiscussionDrawer_meeting.graphql'
import {desktopSidebarShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {ICON_SIZE} from '../../styles/typographyV2'
import {BezierCurve, DiscussionThreadEnum, ZIndex} from '../../types/constEnums'
import DiscussionThreadRoot from '../DiscussionThreadRoot'
import Icon from '../Icon'
import LabelHeading from '../LabelHeading/LabelHeading'
import PlainButton from '../PlainButton/PlainButton'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'stretch',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  width: isOpen || !isDesktop ? DiscussionThreadEnum.WIDTH : 0,
  zIndex: ZIndex.SIDEBAR
}))

const ThreadColumn = styled('div')({
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover': {
    opacity: 0.5
  }
})

const Header = styled('div')({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 8px 8px 12px',
  width: '100%'
})

const HeaderLabel = styled(LabelHeading)({
  textTransform: 'none',
  width: '100%'
})

const StyledCloseButton = styled(PlainButton)({
  height: 24
})

interface Props {
  meetingRef: TeamPromptDiscussionDrawer_meeting$key
  isDesktop: boolean
}

const TeamPromptDiscussionDrawer = ({meetingRef, isDesktop}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDiscussionDrawer_meeting on TeamPromptMeeting {
        localDiscussionId
        isRightDrawerOpen
        id
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()

  const {localDiscussionId, id: meetingId, isRightDrawerOpen} = meeting

  const onToggle = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const isRightDrawerOpen = meeting.getValue('isRightDrawerOpen')
      meeting.setValue(!isRightDrawerOpen, 'isRightDrawerOpen')
    })
  }

  return localDiscussionId ? (
    <ResponsiveDashSidebar
      isOpen={isRightDrawerOpen}
      isRightDrawer
      onToggle={onToggle}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={isDesktop} isOpen={isRightDrawerOpen}>
        <Header>
          <HeaderLabel>{'TODO: show response card'}</HeaderLabel>
          <StyledCloseButton onClick={onToggle}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </Header>
        <ThreadColumn>
          <DiscussionThreadRoot
            discussionId={localDiscussionId!}
            allowedThreadables={['comment', 'task']}
            width={'100%'}
          />
        </ThreadColumn>
      </Drawer>
    </ResponsiveDashSidebar>
  ) : null
}

export default TeamPromptDiscussionDrawer
