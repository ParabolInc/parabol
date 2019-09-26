import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'
import React, {ReactNode} from 'react'
import {Breakpoint} from '../../../../types/constEnums'

const Item = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_INVOICE_SECTION}`,
  display: 'block',
  paddingBottom: 10,
  paddingTop: 10
})


const ItemContent = styled('div')<{addEmphasis: boolean | undefined}>(({addEmphasis}) => ({
  color: addEmphasis ? PALETTE.EMPHASIS_WARM : PALETTE.TEXT_MAIN,
  display: 'flex',
  fontSize: 16,
  fontWeight: addEmphasis ? 600 : 400,
  justifyContent: 'space-between',
  lineHeight: '24px',
  paddingRight: 12,
  width: '100%',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    paddingRight: 20
  }
}))

const Fill = styled('div')({
  flex: 1,
  paddingRight: 16
})

interface Props {
  description: string
  amount: string
  children?: ReactNode
  addEmphasis?: boolean
}

const InvoiceLineItemContent = (props: Props) => {
  const {description, amount, children, addEmphasis} = props
  return (
    <Item>
      <ItemContent addEmphasis={addEmphasis}>
        <Fill>{description}</Fill>
        <div>{amount}</div>
      </ItemContent>
      {children}
    </Item>
  )
}
export default InvoiceLineItemContent
