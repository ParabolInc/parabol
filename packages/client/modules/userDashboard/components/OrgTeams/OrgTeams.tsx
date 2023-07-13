import React from 'react'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'
import RowInfo from '../../../../components/Row/RowInfo'
import {PALETTE} from '../../../../styles/paletteV3'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})
const RowInfoHeader = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const RowInfoHeading = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const color = PALETTE.SLATE_600

const LinkComponent = RowInfoCopy.withComponent('a')

const RowInfoLink = styled(LinkComponent)({
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '16px 8px 16px 16px'
  }
})

const OrgTeams = () => {
  return (
    <StyledPanel label='6 Teams'>
      <Row>
        <div className='flex w-full justify-between px-6 '>
          <div className='flex items-center '>Team Name</div>
          <div className='flex items-center '>Lead</div>
        </div>
      </Row>
      <StyledRow>
        <div className='flex w-full flex-col px-6'>
          <div className='text-gray-700 text-lg font-bold'>bavin</div>
          <div className='flex items-center justify-between'>
            <a href='mailto' title='Send an email' className='text-gray-600 hover:underline'>
              6 members • Last met on 2/2/2021
            </a>
            <a
              href='mailto:test@example.com'
              title='Email'
              className='text-gray-600 hover:underline'
            >
              test@example.com
            </a>
          </div>
        </div>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgTeams
