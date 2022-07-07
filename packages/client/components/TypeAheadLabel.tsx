import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import getSafeRegex from '~/utils/getSafeRegex'

interface Props {
  query: string
  label: string
  highlight?: boolean
}

const Span = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const TypeAheadLabel = (props: Props) => {
  const {query, label, highlight} = props
  const html = highlight ? `<mark style="background: ${PALETTE.SKY_300}">$&</mark>` : `<b>$&</b>`
  return (
    <Span
      dangerouslySetInnerHTML={{
        __html: query ? label.replace(getSafeRegex(query, 'gi'), html) : label
      }}
    />
  )
}

export default TypeAheadLabel
