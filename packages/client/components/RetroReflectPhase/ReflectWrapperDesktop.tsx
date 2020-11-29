import React, {ReactNode, RefObject} from 'react'
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
  columnsRef?: RefObject<HTMLDivElement>
}

const ReflectWrapperDesktop = (props: Props) => {
  const {children, columnsRef} = props
  return (
    <DesktopWrapper>
      <Inner ref={columnsRef}>{children}</Inner>
    </DesktopWrapper>
  )
}

export default ReflectWrapperDesktop
