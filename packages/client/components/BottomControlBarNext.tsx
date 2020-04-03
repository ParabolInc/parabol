import {TransitionStatus} from 'hooks/useTransition'
import React from 'react'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import useGotoNext from 'hooks/useGotoNext'
import handleRightArrow from 'utils/handleRightArrow'

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  status: TransitionStatus
  onTransitionEnd: () => void
}

const BottomControlBarNext = (props: Props) => {
  const {handleGotoNext, onTransitionEnd, status} = props
  const {gotoNext, ref} = handleGotoNext
  return (
    <BottomNavControl
      status={status}
      onTransitionEnd={onTransitionEnd}
      onClick={() => gotoNext()}
      ref={ref}
      onKeyDown={handleRightArrow(() => gotoNext())}
    >
      <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={'Next'} />
    </BottomNavControl>
  )
}

export default BottomControlBarNext
