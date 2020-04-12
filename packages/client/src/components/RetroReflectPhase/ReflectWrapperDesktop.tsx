import React, {ReactNode} from 'react'
import styled from '@emotion/styled'

const DesktopWrapper = styled('div')({
  display: 'flex',
  height: '100%',
  // if the viewport is wide enough for 2+ columns, let them scroll
  overflowX: 'auto',
  width: '100%'
})

const Inner = styled('div')({
  display: 'flex',
  margin: '0 auto'
})

interface Props {
  children: ReactNode
}

const ReflectWrapperDesktop = (props: Props) => {
  const {children} = props
  return (
    <DesktopWrapper>
      <Inner>{children}</Inner>
    </DesktopWrapper>
  )
}

export default ReflectWrapperDesktop
