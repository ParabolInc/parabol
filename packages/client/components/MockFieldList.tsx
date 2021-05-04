import React, {forwardRef} from 'react'
import MockFieldLine from '../modules/meeting/components/MockFieldLine'
import styled from '@emotion/styled'

// forwardRef is just here to ignore warnings when this appears in a menu
const Wrapper = styled('div')({
  padding: '0px 16px'
})

const MockFieldList = forwardRef(() => {
  return (
    <Wrapper>
      {Array.from(Array(3).keys()).map((idx) => {
        return <MockFieldLine key={idx} delay={idx * 40} />
      })}
    </Wrapper>
  )
})

export default MockFieldList
