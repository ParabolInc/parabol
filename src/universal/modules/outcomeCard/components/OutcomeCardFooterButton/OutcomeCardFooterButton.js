import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import BaseButton from 'universal/components/BaseButton'
import IconLabel from 'universal/components/IconLabel'
import styled, {css} from 'react-emotion'

const StyledIconLabel = styled(IconLabel)({
  lineHeight: '1.375rem'
})

const theStyles = {
  borderRadius: ui.borderRadiusSmall,
  color: ui.palette.dark,
  height: ui.cardButtonHeight,
  lineHeight: ui.cardButtonHeight,
  opacity: '.5',
  outline: 0,
  padding: 0,
  width: ui.cardButtonHeight,
  ':hover, :focus': {
    borderColor: appTheme.palette.mid50l,
    opacity: 1
  }
}
const buttonStyles = css(theStyles)
// const StyledButton = styled(BaseButton)(theStyles)

const OutcomeCardFooterButton = (props) => {
  const {icon, innerRef, onClick, onMouseEnter} = props
  const handleOnClick = (e) => {
    if (onClick) onClick(e)
  }
  return (
    <BaseButton
      className={buttonStyles}
      innerRef={innerRef}
      onClick={handleOnClick}
      onMouseEnter={onMouseEnter}
    >
      <StyledIconLabel icon={icon} />
    </BaseButton>
  )
}

OutcomeCardFooterButton.propTypes = {
  icon: PropTypes.string,
  innerRef: PropTypes.func,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func
}

export default OutcomeCardFooterButton
