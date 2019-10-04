// import {TeamMemberStageItem_teamMember} from '../__generated__/TeamMemberStageItem_teamMember.graphql'
// import {TeamMemberStageItem_newMeeting} from '../__generated__/TeamMemberStageItem_newMeeting.graphql'
// import React, {useEffect, useRef} from 'react'
// import styled from '@emotion/styled'
// import {createFragmentContainer} from 'react-relay'
// import graphql from 'babel-plugin-relay/macro'
// import Avatar from '../components/Avatar/Avatar'
// import MeetingSubnavItem from '../components/MeetingSubnavItem'
// import {useGotoStageId} from '../hooks/useMeeting'
// import useAtmosphere from '../hooks/useAtmosphere'
// import {requestIdleCallback} from '../utils/requestIdleCallback'
// import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
// import findStageById from '../utils/meetings/findStageById'

// const AvatarBlock = styled('div')({
//   width: '2rem'
// })

// const TeamMemberStageItemStyles = styled('div')({
//   position: 'relative',
//   // show the DeleteIconButton on hover
//   '&:hover > button': {
//     opacity: 1
//   }
// })

// interface Props {
//   gotoStageId: ReturnType<typeof useGotoStageId> | undefined
//   newMeeting: TeamMemberStageItem_newMeeting | null
//   teamMember: TeamMemberStageItem_teamMember | null
// }

// const TeamMemberStageItem = (props: Props) => {
//   const {gotoStageId, newMeeting, teamMember} = props
//   const {facilitatorUserId, facilitatorStageId, phases, localStage} =
//     newMeeting || UNSTARTED_MEETING
//   const localStageId = (localStage && localStage.id) || ''
//   const {id: teamMemberId, preferredName} = teamMember
//   const agendaItemStageRes = findStageById(phases, teamMemberId, 'teamMemberId')
//   const agendaItemStage = agendaItemStageRes ? agendaItemStageRes.stage : null
//   const {isComplete, isNavigable, isNavigableByFacilitator, id: stageId} = agendaItemStage || {
//     isComplete: false,
//     isNavigable: false,
//     isNavigableByFacilitator: false,
//     id: null
//   }
//   const isLocalStage = localStageId === stageId
//   const isFacilitatorStage = facilitatorStageId === stageId
//   const {picture} = teamMember
//   const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage
//   const ref = useRef<HTMLDivElement>(null)
//   useEffect(() => {
//     if (isFacilitatorStage) {
//       requestIdleCallback(() => {
//         ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
//       })
//     }
//   }, [isFacilitatorStage])

//   useEffect(() => {
//     ref.current && ref.current.scrollIntoView({behavior: 'smooth'})
//   }, [])

//   const atmosphere = useAtmosphere()
//   const {viewerId} = atmosphere
//   const isViewerFacilitator = viewerId === facilitatorUserId

//   return (
//     <TeamMemberStageItemStyles title={preferredName}>
//       <MeetingSubnavItem
//         label={preferredName}
//         metaContent={
//           <AvatarBlock>
//             <Avatar hasBadge={false} picture={picture} size={24} />
//           </AvatarBlock>
//         }
//         isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
//         onClick={gotoStageId && agendaItemStage ? () => gotoStageId(stageId) : undefined}
//         orderLabel={`${idx + 1}.`}
//         isActive={isLocalStage}
//         isComplete={isComplete}
//         isDragging={false}
//         isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
//       />
//     </TeamMemberStageItemStyles>
//   )
// }

// export default createFragmentContainer(TeamMemberStageItem, {
//   newMeeting: graphql`
//     fragment TeamMemberStageItem_newMeeting on NewMeeting {
//       facilitatorStageId
//       facilitatorUserId
//       localStage {
//         id
//       }
//       phases {
//         stages {
//           ... on AgendaItemsStage {
//             id
//             teamMemberId
//             isComplete
//             isNavigable
//             isNavigableByFacilitator
//           }
//         }
//       }
//     }
//   `,
//   teamMember: graphql`
//     fragment TeamMemberStageItem_teamMember on TeamMember {
//       id
//       preferredName
//       teamMember {
//         picture
//       }
//     }
//   `
// })
