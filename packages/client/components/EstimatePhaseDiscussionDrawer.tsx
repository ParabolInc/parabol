import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {desktopSidebarShadow} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {BezierCurve, DiscussionThreadEnum, ZIndex} from '../types/constEnums'
import {DiscussionThreadables} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import Icon from './Icon'
import LabelHeading from './LabelHeading/LabelHeading'
import PlainButton from './PlainButton/PlainButton'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'flex-start',
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
  isDesktop: boolean
  isOpen: boolean
  meeting: EstimatePhaseDiscussionDrawer_meeting
  onToggle: () => void
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isOpen, meeting, onToggle} = props
  const {endedAt, localStage} = meeting
  const {discussionId} = localStage
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment']

  return (
    <Drawer isDesktop={isDesktop} isOpen={isOpen}>
      <Header>
        <HeaderLabel>{'Discussion'}</HeaderLabel>
        <StyledCloseButton onClick={onToggle}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </Header>
      <ThreadColumn>
        <DiscussionThreadRoot
          allowedThreadables={allowedThreadables}
          discussionId={discussionId!}
          width={'100%'}
          emptyState={
            <DiscussionThreadListEmptyState
              allowTasks={false}
              isReadOnly={allowedThreadables.length === 0}
            />
          }
        />
      </ThreadColumn>
    </Drawer>
  )
}

// break it out so we can include this in the mutation
graphql`
  fragment EstimatePhaseDiscussionDrawerEstimateStage on EstimateStage {
    discussionId
  }
`
export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
  meeting: graphql`
    fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
      endedAt
      localStage {
        ...EstimatePhaseDiscussionDrawerEstimateStage @relay(mask: false)
      }
      phases {
        stages {
          ...EstimatePhaseDiscussionDrawerEstimateStage @relay(mask: false)
        }
      }
    }
  `
})
