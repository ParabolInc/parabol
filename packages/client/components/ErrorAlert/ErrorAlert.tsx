/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 */
import React from 'react'
import tinycolor from 'tinycolor2'
import styled from '@emotion/styled'
import ui from '../../styles/ui'
import Icon from '../Icon'
import {MD_ICONS_SIZE_18} from '../../styles/icons'

interface Props {
  message: string
}

const backgroundColor = tinycolor(ui.colorError)
  .setAlpha(0.2)
  .toRgbString()

const ErrorAlertWrapper = styled('div')({
  backgroundColor,
  borderRadius: ui.borderRadiusSmall,
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  marginBottom: '1rem',
  padding: '.5rem 1rem'
})

const SpacedIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem'
})

const ErrorAlert = ({message}: Props) => {
  return (
    <ErrorAlertWrapper role='alert'>
      <SpacedIcon>warning</SpacedIcon>
      <span>{message}</span>
    </ErrorAlertWrapper>
  )
}

export default ErrorAlert
