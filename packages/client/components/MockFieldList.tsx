import styled from '@emotion/styled'
import {forwardRef} from 'react'
import MockFieldLine from '../modules/meeting/components/MockFieldLine'

const Container = styled('div')({
  padding: '0px 16px'
})

const Wrapper = styled('div')({
  padding: '8px 0px'
})

// forwardRef is just here to ignore warnings when this appears in a menu
const MockFieldList = forwardRef(() => {
  return (
    <Container>
      {Array.from(Array(3).keys()).map((idx) => {
        return (
          <Wrapper key={idx}>
            <MockFieldLine delay={idx * 40} />
          </Wrapper>
        )
      })}
    </Container>
  )
})

export default MockFieldList
