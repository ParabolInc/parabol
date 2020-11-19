import styled from '@emotion/styled'
import React, {RefObject, useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {desktopSidebarShadow} from '~/styles/elevation'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {DiscussionThreadEnum, MeetingControlBarEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import {DECELERATE} from '~/styles/animation'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${DECELERATE}`,
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
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

interface Props {
  isDesktop: boolean
  isOpen: boolean
  meeting: EstimatePhaseDiscussionDrawer_meeting
  meetingContentRef: RefObject<HTMLDivElement>
}

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isOpen, meeting, meetingContentRef } = props
  const {id: meetingId, endedAt, localStage} = meeting
  const {serviceTaskId} = localStage
  const ref = useRef<HTMLDivElement>(null)
  const meetingControlBarBottom = 16
  const coverableHeight = isDesktop ? MeetingControlBarEnum.HEIGHT + meetingControlBarBottom : 0
  useCoverable('drawer', ref, coverableHeight, meetingContentRef) || !!endedAt

  return (
    <Drawer isDesktop={isDesktop} isOpen={isOpen} ref={ref}>
      <ThreadColumn>
        <DiscussionThreadRoot
          meetingId={meetingId}
          threadSourceId={serviceTaskId!}
          meetingContentRef={ref}
        />
      </ThreadColumn>
    </Drawer>
  )
}

graphql`
  fragment EstimatePhaseDiscussionDrawerStage on EstimateStage {
    serviceTaskId
  }
`
export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
  meeting: graphql`
    fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        ...EstimatePhaseDiscussionDrawerStage @relay(mask: false)
      }
    }
  `
})
