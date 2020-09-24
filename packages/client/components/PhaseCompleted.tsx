import React from 'react'
import PhaseCompleteTag from './Tag/PhaseCompleteTag'
import UndoablePhaseCompleted from './UndoablePhaseCompleted'

interface Props {
  isComplete: boolean
  canUndo?: boolean
  meetingId?: string
  resetToStageId?: string
}

const PhaseCompleted = (props: Props) => {
  const {isComplete, canUndo, meetingId, resetToStageId} = props
  if (!isComplete) return null
  return (
    <div>
      {canUndo ? (
        <UndoablePhaseCompleted meetingId={meetingId!} resetToStageId={resetToStageId!} />
      ) : (
        <PhaseCompleteTag isComplete={isComplete} />
      )}
    </div>
  )
}

export default PhaseCompleted
