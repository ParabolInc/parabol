import React from 'react'
import styled from '@emotion/styled'
import {meetingSidebarGutterInner} from '../styles/meeting'
import appTheme from '../styles/theme/appTheme'
import ui from '../styles/ui'

const lineHeight = ui.navTopicLineHeight

interface ItemRootProps {
  isActive: boolean
  isComplete: boolean
  isDisabled: boolean
  isDragging: boolean
  onClick: ((e: React.MouseEvent) => void) | undefined
  isUnsyncedFacilitatorStage: boolean
}

const ItemRoot = styled('div')<ItemRootProps>(
  ({isActive, isComplete, isDisabled, isDragging, onClick}) => ({
    backgroundColor: isActive
      ? ui.navMenuLightBackgroundColorActive
      : isDragging
      ? appTheme.palette.light50l
      : '#fff',
    boxShadow: isActive ? `inset ${ui.navMenuLeftBorderWidth} 0 0 ${ui.palette.mid}` : undefined,
    color: onClick ? ui.colorLink : ui.colorText,
    display: 'flex',
    fontSize: 14,
    fontWeight: 400,
    minHeight: '2.5rem',
    opacity: !isActive && isComplete ? 0.5 : undefined,
    padding: '.5rem 0',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
    '&:hover': {
      backgroundColor: onClick && !isActive ? appTheme.palette.light50l : undefined,
      cursor: !isActive && onClick ? 'pointer' : undefined,
      opacity: !isDisabled ? 1 : undefined
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
  width: meetingSidebarGutterInner
})

const ItemLabel = styled('div')<{isComplete: boolean}>(({isComplete}) => ({
  color: 'inherit',
  fontSize: 14,
  flex: 1,
  lineHeight,
  textDecoration: isComplete ? 'line-through' : undefined,
  wordBreak: 'break-word'
}))

const ItemMeta = styled('div')({
  alignContent: 'center',
  display: 'flex',
  height: lineHeight,
  paddingLeft: '.25rem'
})

interface Props {
  isActive: boolean
  isComplete: boolean
  isDisabled: boolean
  isDragging: boolean
  isUnsyncedFacilitatorStage: boolean
  label: string
  metaContent: any
  onClick: ((e: React.MouseEvent) => void) | undefined
  orderLabel: string
}

const MeetingSubnavItem = (props: Props) => {
  const {
    isActive,
    isComplete,
    isDisabled,
    isDragging,
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
      isDragging={isDragging}
      isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
      onClick={!isDisabled ? onClick : undefined}
    >
      <ItemOrderLabel>{orderLabel}</ItemOrderLabel>
      <ItemLabel isComplete={isComplete}>{label}</ItemLabel>
      <ItemMeta>{metaContent}</ItemMeta>
    </ItemRoot>
  )
}

export default MeetingSubnavItem
