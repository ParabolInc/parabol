import React from 'react'
import styled from '@emotion/styled'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'
import LinkButton from './LinkButton'

const ColumnInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  width: '100%'
})

const DimensionHeader = styled('div')({
  display: 'flex',
  padding: '8px 16px'
})

const DimensionName = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  marginRight: 'auto'
})

const StyledLinkButton = styled(LinkButton)({
  fontSize: 12,
  fontWeight: 600
})

const EstimatePhaseDimensionColumn = () => {
  const activeVoting = true
  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>Dimension Name</DimensionName>
        {activeVoting ? null : <StyledLinkButton palette={'blue'}>{'Team Revote'}</StyledLinkButton>}
      </DimensionHeader>
      {activeVoting ? <PokerActiveVoting /> : <PokerDiscussVoting />}
    </ColumnInner>
  )
}

export default EstimatePhaseDimensionColumn
