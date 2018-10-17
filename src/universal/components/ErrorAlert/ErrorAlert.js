/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 * @flow
 */
import React from 'react'
import tinycolor from 'tinycolor2'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

type Props = {
  message: string
}

const backgroundColor = tinycolor(ui.colorError)
  .setAlpha(0.2)
  .toRgbString()

const ErrorAlertWrapper = styled('div')({
  backgroundColor,
  borderRadius: ui.borderRadiusSmall,
  fontSize: appTheme.typography.s3,
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
