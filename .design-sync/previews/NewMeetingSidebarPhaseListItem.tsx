import {NewMeetingSidebarPhaseListItem} from 'parabol-client'

export const PhaseList = () => (
  <div className='w-60 bg-white py-2'>
    <NewMeetingSidebarPhaseListItem
      phaseType='reflect'
      isActive
      isFacilitatorPhase
      isUnsyncedFacilitatorPhase={false}
      handleClick={() => {}}
    />
    <NewMeetingSidebarPhaseListItem
      phaseType='group'
      isActive={false}
      isFacilitatorPhase={false}
      isUnsyncedFacilitatorPhase={false}
      handleClick={() => {}}
      phaseCount={12}
    />
    <NewMeetingSidebarPhaseListItem
      phaseType='vote'
      isActive={false}
      isFacilitatorPhase={false}
      isUnsyncedFacilitatorPhase={false}
      handleClick={() => {}}
    />
    <NewMeetingSidebarPhaseListItem
      phaseType='discuss'
      isActive={false}
      isFacilitatorPhase={false}
      isUnsyncedFacilitatorPhase={false}
      handleClick={() => {}}
      phaseCount={5}
    />
  </div>
)
