import React from 'react'
import styled from '@emotion/styled'
import {typeScale} from 'universal/styles/theme/typography'
import elevation from 'universal/styles/elevation'
import {PALETTE} from 'universal/styles/paletteV2'

const TipBlock = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_LIGHT,
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
  boxShadow: elevation[1],
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
