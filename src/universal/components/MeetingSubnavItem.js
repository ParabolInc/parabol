import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'

const lineHeight = ui.navTopicLineHeight

const ItemRoot = styled('div')(
  ({isActive, isComplete, isDisabled, onClick}) => ({
    backgroundColor: isActive && ui.navMenuLightBackgroundColorActive,
    boxShadow: isActive && `inset ${ui.navMenuLeftBorderWidth} 0 0 ${ui.palette.mid}`,
    color: onClick ? ui.colorLink : ui.colorText,
    display: 'flex',
    fontSize: ui.navTopicFontSize,
    fontWeight: 400,
    minHeight: '2.5rem',
    opacity: !isActive && isComplete && 0.5,
    padding: '.5rem 0',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
    '&:hover': {
      backgroundColor: onClick && !isActive && appTheme.palette.light50l,
      cursor: !isActive && onClick && 'pointer',
      opacity: !isDisabled && 1
    }
  }),
  ({isUnsyncedFacilitatorStage}) =>
    isUnsyncedFacilitatorStage && {
      color: ui.palette.warm,
      opacity: 1,
      '&::after': {
        backgroundColor: ui.palette.warm,
        borderRadius: '100%',
        content: '""',
        display: 'block',
        left: '.875rem',
        marginTop: '-.1875rem',
        position: 'absolute',
        height: '.375rem',
        top: '50%',
        transition: 'opacity .1s ease-in',
        width: '.375rem'
      }
    }
)

const ItemOrderLabel = styled('div')({
  height: lineHeight,
  lineHeight,
  opacity: 0.5,
  paddingRight: '.75rem',
  textAlign: 'right',
  width: ui.meetingSidebarGutterInner
})

const ItemLabel = styled('div')(({isComplete}) => ({
  color: 'inherit',
  fontSize: appTheme.typography.s3,
  flex: 1,
  lineHeight,
  textDecoration: isComplete && 'line-through',
  wordBreak: 'break-word'
}))

const ItemMeta = styled('div')({
  paddingLeft: '.25rem'
})

const MeetingSubnavItem = (props) => {
  const {
    isActive,
    isComplete,
    isDisabled,
    isUnsyncedFacilitatorStage,
    label,
    metaContent,
    onClick,
    orderLabel
  } = props

  return (
    <ItemRoot
      isActive={isActive}
      isComplete={isComplete}
      isDisabled={isDisabled}
      isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
      onClick={!isDisabled ? onClick : null}
    >
      <ItemOrderLabel>{orderLabel}</ItemOrderLabel>
      <ItemLabel isComplete={isComplete}>{label}</ItemLabel>
      <ItemMeta>{metaContent}</ItemMeta>
    </ItemRoot>
  )
}

MeetingSubnavItem.propTypes = {
  isActive: PropTypes.bool,
  isComplete: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isUnsyncedFacilitatorStage: PropTypes.bool,
  label: PropTypes.string,
  metaContent: PropTypes.any,
  onClick: PropTypes.func,
  orderLabel: PropTypes.string
}

export default MeetingSubnavItem
