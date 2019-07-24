/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 */

import React, {Fragment} from 'react'
import styled from '@emotion/styled'

import ui from '../../styles/ui'
import appTheme from '../../styles/theme/appTheme'

const SeparatorContainer = styled('div')<{margin: string | number | undefined}>(({margin}) => ({
  color: ui.labelHeadingColor,
  display: 'flex',
  fontSize: '.6875rem',
  fontWeight: ui.labelHeadingFontWeight,
  lineHeight: ui.labelHeadingLineHeight,
  letterSpacing: ui.labelHeadingLetterSpacing,
  margin,
  maxWidth: '100%',
  padding: '1rem 0',
  textTransform: 'uppercase',
  width: '100%'
}))

const separatorLineStyles = {
  borderBottom: `0.0625rem solid ${appTheme.palette.mid50a}`,
  margin: 'auto',
  opacity: 0.25,
  flex: 1
}

const LeftSeparator = styled('div')({
  ...separatorLineStyles,
  marginRight: '0.5rem'
})

const RightSeparator = styled('div')({
  ...separatorLineStyles,
  marginLeft: '0.5rem'
})

const FullSeparator = styled('div')({
  ...separatorLineStyles,
  flex: 1
})

interface Props {
  margin?: string
  text?: string
}

export default ({margin, text}: Props) => (
  <SeparatorContainer margin={margin}>
    {text ? (
      <Fragment>
        <LeftSeparator />
        {text}
        <RightSeparator />
      </Fragment>
    ) : (
      <FullSeparator />
    )}
  </SeparatorContainer>
)
