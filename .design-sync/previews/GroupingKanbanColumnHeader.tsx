import {GroupingKanbanColumnHeader} from 'parabol-client'

export const WentWell = () => (
  <div className='w-64 rounded-lg bg-white pb-3 shadow'>
    <GroupingKanbanColumnHeader
      canAdd
      groupColor='#66BC8D'
      isWidthExpanded={false}
      onClick={() => {}}
      phaseType='group'
      question='What went well?'
      submitting={false}
      toggleWidth={() => {}}
    />
  </div>
)

export const NeedsWork = () => (
  <div className='w-64 rounded-lg bg-white pb-3 shadow'>
    <GroupingKanbanColumnHeader
      canAdd
      groupColor='#FD6157'
      isWidthExpanded={false}
      onClick={() => {}}
      phaseType='group'
      question='What needs improvement?'
      submitting={false}
      toggleWidth={() => {}}
    />
  </div>
)
