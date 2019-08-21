import React from 'react'
import styled from '@emotion/styled'
import {Breakpoint} from '../../../../types/constEnums'

const Asterisk = styled('span')({
  display: 'inline-block',

  [`@media (min-width: ${Breakpoint.INVOICE_LABEL}px)`]: {
    display: 'none'
  }
})

const InvoiceAsterisk = () => {
  return <Asterisk>{'*'}</Asterisk>
}

export default InvoiceAsterisk
