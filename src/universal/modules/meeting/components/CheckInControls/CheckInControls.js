import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import withHotkey from 'react-hotkey-hoc'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import BounceBlock from 'universal/components/BounceBlock/BounceBlock'
import getWindowSize from 'universal/styles/helpers/getWindowSize'
import {meetingSidebarBreakpoint} from 'universal/styles/meeting'
import handleRightArrow from 'universal/utils/handleRightArrow'

const ButtonBlock = styled('div')({
  display: 'flex'
})

const CheckInControls = (props) => {
  const {bindHotkey, checkInPressFactory, currentMemberName, localPhaseItem, gotoNextRef} = props

  const handleOnClickPresent = checkInPressFactory(true)
  const handleOnClickAbsent = checkInPressFactory(false)

  bindHotkey('h', handleOnClickPresent)
  bindHotkey('n', handleOnClickAbsent)

  // NOTE: this doesn’t listen to browser resize
  const windowSize = getWindowSize()
  const isSmallerBreakpoint = windowSize.width < meetingSidebarBreakpoint

  const nextLabel = isSmallerBreakpoint ? 'Here' : `${currentMemberName} is Here`
  const skipLabel = isSmallerBreakpoint ? 'Not Here' : `${currentMemberName} is Not Here`

  // TODO: theme-able? (button colors)
  return (
    <ButtonBlock>
      <BounceBlock animationDelay='30s' key={`checkIn${localPhaseItem}buttonAnimation`}>
        <BottomNavControl
          aria-label={`Mark ${currentMemberName} as “here” and move on`}
          key={`checkIn${localPhaseItem}nextButton`}
          onClick={handleOnClickPresent}
          onKeyDown={handleRightArrow(handleOnClickPresent)}
          innerRef={gotoNextRef}
        >
          <BottomNavIconLabel icon='check_circle' iconColor='green' label={nextLabel} />
        </BottomNavControl>
      </BounceBlock>
      <BottomNavControl
        aria-label={`Mark ${currentMemberName} as “not here” and move on`}
        size='medium'
        key={`checkIn${localPhaseItem}skipButton`}
        onClick={handleOnClickAbsent}
      >
        <BottomNavIconLabel icon='remove_circle' iconColor='red' label={skipLabel} />
      </BottomNavControl>
    </ButtonBlock>
  )
}

CheckInControls.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  checkInPressFactory: PropTypes.func.isRequired,
  currentMemberName: PropTypes.string,
  localPhaseItem: PropTypes.any.isRequired
}

export default withHotkey(CheckInControls)
