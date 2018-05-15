import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import withHotkey from 'react-hotkey-hoc'
import Button from 'universal/components/Button/Button'
import BounceBlock from 'universal/components/BounceBlock/BounceBlock'

const ButtonBlock = styled('div')({
  display: 'flex'
})

const CheckInControls = (props) => {
  const {
    bindHotkey,
    checkInPressFactory,
    currentMemberName,
    localPhaseItem,
    nextMemberName,
    nextPhaseName
  } = props

  const handleOnClickPresent = checkInPressFactory(true)
  const handleOnClickAbsent = checkInPressFactory(false)

  bindHotkey('h', handleOnClickPresent)
  bindHotkey('n', handleOnClickAbsent)

  const nextLabel = (
    <span>
      {`${currentMemberName} is `}
      <u>{'h'}</u>
      {'ere – '}
      {nextMemberName ? `Move to ${nextMemberName}` : `move to ${nextPhaseName}`}
    </span>
  )

  const skipLabel = (
    <span>
      {`${currentMemberName} is `}
      <u>{'n'}</u>
      {'ot here – '}
      {nextMemberName ? `Skip to ${nextMemberName}` : `skip to ${nextPhaseName}`}
    </span>
  )

  // TODO: theme-able? (button colors)

  return (
    <ButtonBlock>
      <BounceBlock animationDelay='30s' key={`checkIn${localPhaseItem}buttonAnimation`}>
        <Button
          aria-label={`Mark ${currentMemberName} as “here” and move on`}
          buttonStyle='flat'
          colorPalette='dark'
          icon='check-circle'
          iconLarge
          iconPalette='green'
          iconPlacement='left'
          key={`checkIn${localPhaseItem}nextButton`}
          label={nextLabel}
          onClick={handleOnClickPresent}
          buttonSize='medium'
        />
      </BounceBlock>
      <Button
        aria-label={`Mark ${currentMemberName} as “not here” and move on`}
        buttonStyle='flat'
        colorPalette='dark'
        icon='minus-circle'
        iconLarge
        iconPalette='red'
        iconPlacement='left'
        key={`checkIn${localPhaseItem}skipButton`}
        label={skipLabel}
        onClick={handleOnClickAbsent}
        buttonSize='medium'
      />
    </ButtonBlock>
  )
}

CheckInControls.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  checkInPressFactory: PropTypes.func.isRequired,
  currentMemberName: PropTypes.string,
  localPhaseItem: PropTypes.number,
  nextMemberName: PropTypes.string,
  nextPhaseName: PropTypes.string
}

export default withHotkey(CheckInControls)
