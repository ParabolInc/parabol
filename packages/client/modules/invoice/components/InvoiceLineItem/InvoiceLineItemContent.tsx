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


const ItemContent = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 16,
  lineHeight: '24px',
  paddingRight: 12,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 20,
    paddingRight: 20
  }
})

const Fill = styled('div')({
  flex: 1,
  paddingRight: 16
})

interface Props {
  description: string
  amount: string
  children?: ReactNode
}

const InvoiceLineItemContent = (props: Props) => {
  const {description, amount, children} = props
  return (
    <Item>
      <ItemContent>
        <Fill>{description}</Fill>
        <div>{amount}</div>
      </ItemContent>
      {children}
    </Item>
  )
}
export default InvoiceLineItemContent
