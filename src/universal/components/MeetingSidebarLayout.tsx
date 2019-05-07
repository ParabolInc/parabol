// import {MeetingSidebarLayout_viewer} from '__generated__/MeetingSidebarLayout_viewer.graphql'
// import React, {ReactNode, useCallback} from 'react'
// import styled from 'react-emotion'
// import {createFragmentContainer, graphql} from 'react-relay'
// import {Link} from 'react-router-dom'
// import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
// import LogoBlock from 'universal/components/LogoBlock/LogoBlock'
// import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
// import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList'
// import ScrollableBlock from 'universal/components/ScrollableBlock'
// import SidebarToggle from 'universal/components/SidebarToggle'
// import useAtmosphere from 'universal/hooks/useAtmosphere'
// import {DECELERATE} from 'universal/styles/animation'
// import makeShadowColor from 'universal/styles/helpers/makeShadowColor'
// import {meetingChromeBoxShadow, meetingSidebarMediaQuery, meetingSidebarWidth} from 'universal/styles/meeting'
// import {PALETTE} from 'universal/styles/paletteV2'
// import {MeetingTypeEnum} from 'universal/types/graphql'
// import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
// import isDemoRoute from '../utils/isDemoRoute'
//
// interface SidebarStyleProps {
//   isMeetingSidebarCollapsed: boolean
// }
//
// export const enum MEETING_SIDEBAR {
//   BREAKPOINT = 800
// }
//
// const SidebarHeader = styled('div')({
//   alignItems: 'center',
//   display: 'flex',
//   position: 'relative'
// })
//
// const StyledToggle = styled(SidebarToggle)({
//   margin: '0 .75rem 0 1.5rem'
// })
//
// const SidebarParent = styled('div')({
//   backgroundColor: '#fff',
//   display: 'flex',
//   flex: 1,
//   flexDirection: 'column',
//   maxWidth: meetingSidebarWidth,
//   minWidth: meetingSidebarWidth,
//   padding: '1.25rem 0 0'
// })
//
// const TeamDashboardLink = styled(Link)({
//   fontSize: 20,
//   fontWeight: 600,
//   lineHeight: '1.5',
//   ':hover': {
//     color: PALETTE.TEXT.PURPLE,
//     cursor: 'pointer'
//   }
// })
//
// const boxShadowNone = makeShadowColor(0)
// const MeetingSidebarStyles = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
//   boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[2],
//   display: 'flex',
//   flexDirection: 'column',
//   height: '100vh',
//   position: 'absolute',
//   transition: `
//     box-shadow 100ms ${DECELERATE},
//     transform 100ms ${DECELERATE}
//   `,
//   transform: isMeetingSidebarCollapsed
//     ? `translate3d(-${meetingSidebarWidth}, 0, 0)`
//     : 'translate3d(0, 0, 0)',
//   width: meetingSidebarWidth,
//   zIndex: 400,
//
//   [meetingSidebarMediaQuery]: {
//     boxShadow: isMeetingSidebarCollapsed ? boxShadowNone : meetingChromeBoxShadow[0]
//   }
// }))
//
// const SidebarBackdrop = styled('div')(({isMeetingSidebarCollapsed}: SidebarStyleProps) => ({
//   backgroundColor: PALETTE.BACKGROUND.BACKDROP,
//   bottom: 0,
//   left: 0,
//   opacity: isMeetingSidebarCollapsed ? 0 : 1,
//   pointerEvents: isMeetingSidebarCollapsed ? 'none' : undefined,
//   position: 'fixed',
//   right: 0,
//   top: 0,
//   transition: `opacity 100ms ${DECELERATE}`,
//   zIndex: 300,
//
//   [meetingSidebarMediaQuery]: {
//     display: 'none'
//   }
// }))
//
// interface Props {
//   children: ReactNode
//   isMeetingSidebarCollapsed: boolean
//   meetingType: MeetingTypeEnum
//   toggleSidebar: () => void
//   viewer: MeetingSidebarLayout_viewer
// }
//
// const MeetingSidebarLayout = (props: Props) => {
//   const {
//     children,
//     isMeetingSidebarCollapsed,
//     meetingType,
//     toggleSidebar,
//     viewer
//   } = props
//   const {team} = viewer
//   if (!team) return null
//   const {id: teamId, name: teamName} = team
//   const atmosphere = useAtmosphere()
//   const onTransitionEnd = useCallback(
//     (e: React.TransitionEvent) => {
//       if (e.target === e.currentTarget && e.propertyName === 'transform') {
//         atmosphere.eventEmitter.emit('meetingSidebarCollapsed', isMeetingSidebarCollapsed)
//       }
//     },
//     [isMeetingSidebarCollapsed]
//   )
//   const meetingLabel = meetingTypeToLabel[meetingType]
//   const teamLink = isDemoRoute() ? '/create-account' : `/team/${teamId}`
//
//   return (
//     <>
//       <MeetingSidebarStyles
//         isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
//         onTransitionEnd={onTransitionEnd}
//       >
//         <SidebarParent>
//           <SidebarHeader>
//             <StyledToggle onClick={toggleSidebar} />
//             <TeamDashboardLink to={teamLink}>{teamName}</TeamDashboardLink>
//           </SidebarHeader>
//           <MeetingSidebarLabelBlock>
//             <LabelHeading>{`${meetingLabel} Meeting`}</LabelHeading>
//           </MeetingSidebarLabelBlock>
//           <ScrollableBlock>
//             <NewMeetingSidebarPhaseList
//               gotoStageId={gotoStageId}
//               meetingType={meetingType}
//               phaseTypes={phaseTypes}
//               viewer={viewer}>
//               {children}
//             </NewMeetingSidebarPhaseList>
//           </ScrollableBlock>
//           <LogoBlock variant='primary' />
//         </SidebarParent>
//       </MeetingSidebarStyles>
//       <SidebarBackdrop
//         onClick={toggleSidebar}
//         isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}
//       />
//     </>
//   )
// }
//
// export default createFragmentContainer(
//   MeetingSidebarLayout,
//   graphql`
//     fragment MeetingSidebarLayout_viewer on User {
//       ...NewMeetingSidebar_viewer
//       team(teamId: $teamId) {
//         id
//         name
//         }
//       }
//     }
//   `
// )
