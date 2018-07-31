/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 * @flow
 */

import React, {Fragment} from 'react'
import styled from 'react-emotion'

import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

const SeparatorContainer = styled('div')(({margin}) => ({
  color: ui.labelHeadingColor,
  display: 'flex',
  fontSize: ui.labelHeadingFontSize,
  fontWeight: ui.labelHeadingFontWeight,
  lineHeight: ui.labelHeadingLineHeight,
  letterSpacing: ui.labelHeadingLetterSpacing,
  margin,
  maxWidth: '100%',
  padding: '1rem 0',
  textTransform: 'uppercase'
}))

const separatorLineStyles = {
  borderBottom: `0.0625rem solid ${appTheme.palette.mid20a}`,
  margin: 'auto',
  width: '10rem'
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
  width: '20rem'
})

type Props = {
  margin?: string,
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
