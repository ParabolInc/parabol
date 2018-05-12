import PropTypes from 'prop-types'
import React from 'react'
import FontAwesome from 'react-fontawesome'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'

const {warm} = appTheme.palette
const color = appTheme.palette.warm40l

const ButtonBase = styled(PlainButton)(({disabled}) => ({
  color,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: appTheme.typography.s3,
  opacity: disabled && '.5',
  '&:hover,:focus,:active': {
    boxShadow: 'none',
    color: disabled ? color : warm,
    outline: 'none'
  }
}))

const IconButton = (props) => {
  const {
    'aria-label': ariaLabel,
    disabled,
    iconName,
    iconSize,
    onClick,
    title,
    type = 'button'
  } = props
  // must declare type="button" or it gets treated as a submit in the welcome wizard. wtf react
  return (
    <ButtonBase
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type={type}
    >
      <FontAwesome name={iconName} size={iconSize} />
    </ButtonBase>
  )
}

IconButton.propTypes = {
  'aria-label': PropTypes.string,
  disabled: PropTypes.bool,
  iconName: PropTypes.string,
  iconSize: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string,
  type: PropTypes.string
}

export default IconButton
