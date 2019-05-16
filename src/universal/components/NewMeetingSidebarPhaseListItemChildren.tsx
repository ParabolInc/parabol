// import {NewMeetingSidebarPhaseListItemChildren_viewer} from '__generated__/NewMeetingSidebarPhaseListItemChildren_viewer.graphql'
// import React from 'react'
// import {createFragmentContainer, graphql} from 'react-relay'
// import {useGotoStageId} from 'universal/hooks/useMeeting'
// import useRouter from 'universal/hooks/useRouter'
// import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
// import lazyPreload from 'universal/utils/lazyPreload'
//
// interface Props {
//   gotoStageId: ReturnType<typeof useGotoStageId>
//   meetingType: MeetingTypeEnum
//   phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
//   viewer: NewMeetingSidebarPhaseListItemChildren_viewer
// }
//
// const RetroSidebarDiscussSection = lazyPreload(() =>
//   import(/*WebpackChunkName: RetroSidebarDiscussSection*/ 'universal/components/RetroSidebarDiscussSection')
// )
//
// const ActionSidebarAgendaItemsSection = lazyPreload(() =>
//   import(/*WebpackChunkName: ActionSidebarAgendaItemsSection*/ 'universal/components/ActionSidebarAgendaItemsSection')
// )
//
// const NewMeetingSidebarPhaseListItemChildren = (props: Props) => {
//   const {gotoStageId, meetingType, phaseType, viewer} = props
//   const {team} = viewer
//   const {newMeeting} = team!
//   if (phaseType === NewMeetingPhaseTypeEnum.discuss) {
//     if (!newMeeting || !newMeeting.localPhase || newMeeting.localPhase.phaseType !== phaseType) {
//       return null
//     }
//     return <RetroSidebarDiscussSection gotoStageId={gotoStageId} viewer={viewer} />
//   } else if (phaseType === NewMeetingPhaseTypeEnum.agendaitems) {
//     return <ActionSidebarAgendaItemsSection gotoStageId={gotoStageId} viewer={viewer} />
//   }
//   return null
// }
//
// export default createFragmentContainer(
//   NewMeetingSidebarPhaseListItemChildren,
//   graphql`
//     fragment NewMeetingSidebarPhaseListItemChildren_viewer on User {
//       team(teamId: $teamId) {
//         newMeeting {
//           localPhase {
//             phaseType
//           }
//         }
//       }
//       ...RetroSidebarDiscussSection_viewer
//       ...ActionSidebarAgendaItemsSection_viewer
//     }
//   `
// )
