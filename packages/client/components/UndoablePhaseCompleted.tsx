import React from 'react'
import useHotkey from '~/hooks/useHotkey'

interface Props {
  onUndo: () => void
}

const UndoablePhaseCompleted = (props: Props) => {
  const {onUndo} = props
  useHotkey('i d i d n t m e a n t o', () => {
    onUndo()
  })
  return <div onClick={onUndo}>undoable phase completed</div>
}

export default UndoablePhaseCompleted
