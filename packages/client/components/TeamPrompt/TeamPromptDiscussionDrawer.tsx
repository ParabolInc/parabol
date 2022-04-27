import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import findStageById from '~/utils/meetings/findStageById'
import {TeamPromptDiscussionDrawer_meeting$key} from '~/__generated__/TeamPromptDiscussionDrawer_meeting.graphql'
import {desktopSidebarShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {ICON_SIZE} from '../../styles/typographyV2'
import {BezierCurve, DiscussionThreadEnum, ZIndex} from '../../types/constEnums'
import Avatar from '../Avatar/Avatar'
import DiscussionThreadRoot from '../DiscussionThreadRoot'
import Icon from '../Icon'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import {TeamMemberName} from './TeamPromptResponseCard'

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

const DiscussionResponseCard = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '8px 8px 8px 12px',
  width: '100%'
})

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px'
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

interface Props {
  meetingRef: TeamPromptDiscussionDrawer_meeting$key
  isDesktop: boolean
}

const TeamPromptDiscussionDrawer = ({meetingRef, isDesktop}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDiscussionDrawer_meeting on TeamPromptMeeting {
        localStageId
        isRightDrawerOpen
        id
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              discussionId
              teamMember {
                picture
                preferredName
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()

  const {localStageId, id: meetingId, isRightDrawerOpen} = meeting
  if (!localStageId) {
    return null
  }

  const stage = findStageById(meeting.phases, localStageId)
  if (!stage) {
    return null
  }

  const discussionId = stage.stage.discussionId
  if (!discussionId) {
    return null
  }

  const teamMember = stage.stage.teamMember
  if (!teamMember) {
    return null
  }

  const onToggle = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const isRightDrawerOpen = meeting.getValue('isRightDrawerOpen')
      meeting.setValue(!isRightDrawerOpen, 'isRightDrawerOpen')
    })
  }

  const content = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: "What's up! This editor instance exports its "},
          {type: 'text', marks: [{type: 'bold'}], text: 'content'},
          {type: 'text', text: ' as JSON.'}
        ]
      }
    ]
  }

  return (
    <ResponsiveDashSidebar
      isOpen={isRightDrawerOpen}
      isRightDrawer
      onToggle={onToggle}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={isDesktop} isOpen={isRightDrawerOpen}>
        <DiscussionResponseCard>
          <Header>
            <Avatar picture={teamMember.picture} size={48} />
            <TeamMemberName>{teamMember.preferredName}</TeamMemberName>
            {/* :TODO: (jmtaber129): Show when response was last updated */}
            <StyledCloseButton onClick={onToggle}>
              <CloseIcon>close</CloseIcon>
            </StyledCloseButton>
          </Header>
          <PromptResponseEditor autoFocus={true} content={content} readOnly={true} />
          {/* :TODO: (jmtaber129): Include reactjis */}
        </DiscussionResponseCard>
        <ThreadColumn>
          <DiscussionThreadRoot
            discussionId={discussionId}
            allowedThreadables={['comment', 'task']}
            width={'100%'}
          />
        </ThreadColumn>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default TeamPromptDiscussionDrawer
