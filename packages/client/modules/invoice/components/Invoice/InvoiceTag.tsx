import React from 'react'
import {InvoiceStatusEnum} from '../../../../types/graphql'
import styled from '@emotion/styled'
import {Breakpoint} from '../../../../types/constEnums'
import Tag from '../../../../components/Tag/Tag'

const TagBlock = styled('div')({
  position: 'absolute',
  right: 12,
  top: 12,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    right: 20,
    top: 20
  }

})

const lookup = {
  [InvoiceStatusEnum.PENDING]: {
    colorPalette: 'gray' as 'gray',
    label: 'Payment Processing'
  },
  [InvoiceStatusEnum.UPCOMING]: {
    colorPalette: 'light' as 'light',
    label: 'Current Estimation'
  }
}

interface Props {
  status: InvoiceStatusEnum
}
const InvoiceTag = (props: Props) => {
  const {status} = props
  if (status !== InvoiceStatusEnum.UPCOMING && status !== InvoiceStatusEnum.PENDING) return null
  const {colorPalette, label} = lookup[status]
  return (
    <TagBlock >
      <Tag colorPalette={colorPalette} label={label} />
    </TagBlock>
  )
}

export default InvoiceTag
