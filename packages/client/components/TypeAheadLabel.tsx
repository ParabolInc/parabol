import styled from '@emotion/styled'
import * as DOMPurify from 'dompurify'
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
  const queryHtml = highlight
    ? `<mark style="background: ${PALETTE.SKY_300}">$&</mark>`
    : `<b>$&</b>`
  const cleanInnerHtml = DOMPurify.sanitize(
    query ? label.replace(getSafeRegex(query, 'gi'), queryHtml) : label
  )
  return (
    <Span
      dangerouslySetInnerHTML={{
        __html: cleanInnerHtml
      }}
    />
  )
}

export default TypeAheadLabel
