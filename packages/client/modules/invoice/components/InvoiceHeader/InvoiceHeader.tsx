import React from 'react'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {Breakpoint} from '../../../../types/constEnums'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {InvoiceHeader_invoice} from '__generated__/InvoiceHeader_invoice.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'

const Header = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontWeight: 600
})

const LogoPanel = styled('div')({
  backgroundColor: '#FFFFFF',
  border: `1px solid ${PALETTE.BORDER_MAIN_40}`,
  borderRadius: 8,
  height: 64,
  padding: 8,
  width: 64,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    height: 96,
    width: 96
  }
})

const Picture = styled('img')({
  height: 'auto',
  width: '100%'
})

const Info = styled('div')({
  flex: 1,
  marginLeft: '1.25rem'
})

const OrgName = styled('div')({
  fontSize: 20,
  lineHeight: '1.5',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 24
  }
})

const Email = styled('div')({
  fontSize: 14,
  lineHeight: '20px'
})

interface Props {
  invoice: InvoiceHeader_invoice
}

const InvoiceHeader = (props: Props) => {
  const {invoice} = props
  const {orgName, billingLeaderEmails, picture} = invoice
  return (
    <Header>
      <LogoPanel>
        <Picture
          alt={`Logo for ${orgName}`}
          src={picture || defaultOrgAvatar}
        />
      </LogoPanel>
      <Info>
        <OrgName>{orgName}</OrgName>
        {billingLeaderEmails.map((email) => (
          <Email key={`email${email}`}>
            {email}
          </Email>
        ))}
      </Info>
    </Header>
  )
}

export default createFragmentContainer(
  InvoiceHeader,
  {
    invoice: graphql`
      fragment InvoiceHeader_invoice on Invoice {
        orgName
        billingLeaderEmails
        picture
      }`
  }
)
