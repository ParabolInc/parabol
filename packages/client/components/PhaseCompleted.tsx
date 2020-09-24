import React from 'react'
import PhaseCompleteTag from './Tag/PhaseCompleteTag'
import UndoablePhaseCompleted from './UndoablePhaseCompleted'

interface Props {
  isComplete: boolean
  canUndo?: boolean
}

const PhaseCompleted = (props: Props) => {
  const {isComplete, canUndo} = props
  if (!isComplete) return null
  return (
    <div>
      {canUndo ? (
        <UndoablePhaseCompleted onUndo={() => console.log('on undo handler invoked')} />
      ) : (
        <PhaseCompleteTag isComplete={isComplete} />
      )}
    </div>
  )
}

export default PhaseCompleted
