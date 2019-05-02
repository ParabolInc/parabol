import {MeetingSidebarLayout_viewer} from '__generated__/MeetingSidebarLayout_viewer.graphql'
import React, {useCallback} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {DECELERATE} from 'universal/styles/animation'
import makeShadowColor from 'universal/styles/helpers/makeShadowColor'
import {
  meetingChromeBoxShadow,
  meetingSidebarMediaQuery,
  meetingSidebarWidth
} from 'universal/styles/meeting'
import {PALETTE} from 'universal/styles/paletteV2'
import {MeetingTypeEnum} from 'universal/types/graphql'

interface SidebarStyleProps {
  isMeetingSidebarCollapsed: boolean
}

const boxShadowNone = makeShadowColor(0)
const MeetingSidebarStyles = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
  boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[2],
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'absolute',
  transition: `
    box-shadow 100ms ${DECELERATE},
    transform 100ms ${DECELERATE}
  `,
  transform: isMeetingSidebarCollapsed
    ? `translate3d(-${meetingSidebarWidth}, 0, 0)`
    : 'translate3d(0, 0, 0)',
  width: meetingSidebarWidth,
  zIndex: 400,

  [meetingSidebarMediaQuery]: {
    boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[0]
  }
}))

const SidebarBackdrop = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
  backgroundColor: PALETTE.BACKGROUND.BACKDROP,
  bottom: 0,
  left: 0,
  opacity: isMeetingSidebarCollapsed ? 0 : 1,
  pointerEvents: isMeetingSidebarCollapsed ? 'none' : undefined,
  position: 'fixed',
  right: 0,
  top: 0,
  transition: `opacity 100ms ${DECELERATE}`,
  zIndex: 300,

  [meetingSidebarMediaQuery]: {
    display: 'none'
  }
}))

interface Props {
  gotoStageId: (stageId: string) => void
  isMeetingSidebarCollapsed: boolean
  meetingType: MeetingTypeEnum
  toggleSidebar: () => void
  viewer: MeetingSidebarLayout_viewer
}

const MeetingSidebarLayout = (props: Props) => {
  const {gotoStageId, isMeetingSidebarCollapsed, meetingType, toggleSidebar, viewer} = props
  const {team} = viewer
  if (!team) return null
  const atmosphere = useAtmosphere()
  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.target === e.currentTarget && e.propertyName === 'transform') {
        atmosphere.eventEmitter.emit('meetingSidebarCollapsed', isMeetingSidebarCollapsed)
      }
    },
    [isMeetingSidebarCollapsed]
  )
  return (
    <>
      <MeetingSidebarStyles
        isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
        onTransitionEnd={onTransitionEnd}
      >
        <NewMeetingSidebar
          gotoStageId={gotoStageId}
          meetingType={meetingType}
          toggleSidebar={toggleSidebar}
          viewer={viewer}
        />
      </MeetingSidebarStyles>
      <SidebarBackdrop
        onClick={toggleSidebar}
        isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
      />
    </>
  )
}

export default createFragmentContainer(
  MeetingSidebarLayout,
  graphql`
    fragment MeetingSidebarLayout_viewer on User {
      ...NewMeetingSidebar_viewer
      team(teamId: $teamId) {
        id
      }
    }
  `
)
