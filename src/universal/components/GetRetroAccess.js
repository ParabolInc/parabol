import React from 'react'
import styled from '@emotion/styled'

const ModalBoundary = styled('div')({
  width: 200,
  height: 200,
  background: 'white'
})

const GetRetroAccess = () => {
  return <ModalBoundary>Pay me now</ModalBoundary>
}

export default GetRetroAccess
