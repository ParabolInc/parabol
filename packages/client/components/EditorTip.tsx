import React from 'react'
import styled from '@emotion/styled'
import {typeScale} from '../styles/theme/typography'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV2'

const TipBlock = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontSize: typeScale[1],
  lineHeight: typeScale[7]
})

const TipCopy = styled('span')({
  whiteSpace: 'nowrap'
})

const shortcutBlockSize = '1.25rem'

const ShortcutBlock = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  height: shortcutBlockSize,
  fontSize: typeScale[1],
  fontWeight: 600,
  lineHeight: shortcutBlockSize,
  margin: '0 .5em',
  textAlign: 'center',
  width: shortcutBlockSize
})

const EditorTip = () => (
  <TipBlock>
    <TipCopy>Press the</TipCopy>
    <ShortcutBlock>?</ShortcutBlock>
    <TipCopy>key for card formatting help</TipCopy>
  </TipBlock>
)

export default EditorTip
