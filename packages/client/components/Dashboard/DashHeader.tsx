import React, {ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV2'
import styled from '@emotion/styled'
import {AppBar, Gutters, Filter} from '../../types/constEnums'

const RootBlock = styled('div')<{hasOverlay?: boolean}>(({hasOverlay}) => ({
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderBottom: `1px solid ${PALETTE.BORDER_DASH_LIGHT}`,
  display: 'flex',
  filter: hasOverlay ? Filter.BENEATH_DIALOG : undefined,
  width: '100%'
}))

const InnerBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto',
  minHeight: AppBar.HEIGHT,
  padding: `0 ${Gutters.DASH_GUTTER}`,
  width: '100%'
})

interface Props {
  children: ReactNode
  hasOverlay?: boolean
}

const DashHeader = (props: Props) => {
  const {children, hasOverlay} = props
  return (
    <RootBlock hasOverlay={hasOverlay}>
      <InnerBlock>{children}</InnerBlock>
    </RootBlock>
  )
}

export default DashHeader
