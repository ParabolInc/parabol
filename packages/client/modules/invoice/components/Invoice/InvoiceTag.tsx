import React from 'react'
import {InvoiceStatusEnum} from '../../../../types/graphql'
import styled from '@emotion/styled'
import {Breakpoint} from '../../../../types/constEnums'
import {PALETTE} from '../../../../styles/paletteV2'
import BaseTag from '../../../../components/Tag/BaseTag'

const TagBlock = styled('div')({
  position: 'absolute',
  right: 12,
  top: 12,
  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    right: 20,
    top: 20
  }
})

const StyledBaseTag = styled(BaseTag)({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  color: PALETTE.TEXT_MAIN
})

const lookup = {
  [InvoiceStatusEnum.PENDING]: {
    label: 'Payment Processing'
  },
  [InvoiceStatusEnum.UPCOMING]: {
    label: 'Current Estimation'
  }
}

interface Props {
  status: InvoiceStatusEnum
}
const InvoiceTag = (props: Props) => {
  const {status} = props
  if (status !== InvoiceStatusEnum.UPCOMING && status !== InvoiceStatusEnum.PENDING) return null
  const {label} = lookup[status]
  return (
    <TagBlock>
      <StyledBaseTag>{label}</StyledBaseTag>
    </TagBlock>
  )
}

export default InvoiceTag
