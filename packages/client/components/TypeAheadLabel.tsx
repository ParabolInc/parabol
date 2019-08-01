import React from 'react'
import styled from '@emotion/styled'

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
        __html: query ? label.replace(new RegExp(query, 'gi'), `<b>$&</b>`) : label
      }}
    />
  )
}

export default TypeAheadLabel
