import React from 'react'
import styled from '@emotion/styled'
import getSafeRegex from 'utils/getSafeRegex'

interface Props {
  query: string
  label: string
}

const Span = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const TypeAheadLabel = (props: Props) => {
  const {query, label} = props
  return (
    <Span
      dangerouslySetInnerHTML={{
        __html: query ? label.replace(getSafeRegex(query, 'gi'), `<b>$&</b>`) : label
      }}
    />
  )
}

export default TypeAheadLabel
