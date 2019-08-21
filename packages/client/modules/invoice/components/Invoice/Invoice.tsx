import React from 'react'
import InvoiceHeader from '../InvoiceHeader/InvoiceHeader'
import InvoiceFooter from '../InvoiceFooter/InvoiceFooter'
import makeMonthString from '../../../../utils/makeMonthString'
import makeDateString from '../../../../utils/makeDateString'
import InvoiceLineItem from '../InvoiceLineItem/InvoiceLineItem'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import {Elevation} from '../../../../styles/elevation'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {Invoice_viewer} from '__generated__/Invoice_viewer.graphql'
import InvoiceAsterisk from './InvoiceAsterisk'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint} from '../../../../types/constEnums'
import InvoiceFailedStamp from './InvoiceFailedStamp'
import InvoiceTag from './InvoiceTag'
import {InvoiceStatusEnum} from '../../../../types/graphql'
import NextMonthChargesLineItem from '../InvoiceLineItem/NextMonthChargesLineItem'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'


const chargeStatus = {
  [InvoiceStatusEnum.PAID]: 'Charged',
  [InvoiceStatusEnum.FAILED]: 'Failed charge',
  [InvoiceStatusEnum.PENDING]: 'Pending charge',
  [InvoiceStatusEnum.UPCOMING]: 'Will be charged'
}

const AmountSection = styled('div')({
  borderTop: `1px solid ${PALETTE.BORDER_INVOICE_SECTION}`,
  marginTop: 1,
  paddingTop: 16,
  paddingRight: 12,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    paddingTop: 32,
    paddingRight: 20
  }
})

const AmountLine = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 24,
  fontWeight: 600,
  lineHeight: '34px'
})

const AmountLineSub = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 18,
  lineHeight: '28px'
})

const Wrap = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  overflow: 'hidden'
})

const InvoiceStyles = styled('div')({
  backgroundColor: 'white',
  boxShadow: Elevation.SHEET,
  color: PALETTE.TEXT_MAIN,
  margin: '0 auto',
  maxWidth: 600,
  padding: 16,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    margin: '2rem auto',
    padding: 32
  }
})

const Panel = styled('div')({
  backgroundColor: '#fff',
  border: `1px solid ${PALETTE.BORDER_DARK}`,
  borderRadius: 8,
  margin: `16px 0`,
  padding: `12px 0 12px 12px`,
  position: 'relative',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    margin: `32px 0`,
    padding: `32px 0 32px 32px`
  }
})

const Label = styled('div')({
  color: PALETTE.TEXT_INVOICE_LABEL,
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase'
})

const Subject = styled('div')({
  fontSize: 32,
  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 34
  }
})

const SectionHeader = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_INVOICE_SECTION}`,
  marginTop: 12,
  paddingBottom: '.75rem',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    marginTop: 20
  }
})

const Heading = styled('div')({
  fontSize: 18,
  fontWeight: 600,
  lineHeight: '24px',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 24
  }
})

const Meta = styled('div')<{isError?: boolean}>(({isError}) => ({
  color: isError ? PALETTE.ERROR_MAIN : undefined,
  fontSize: 14
}))

const HeadingLabel = styled('div')({
  display: 'block',
  fontSize: 14,
  lineHeight: '16px',

  [`@media (min-width: ${Breakpoint.INVOICE_LABEL}px)`]: {
    backgroundColor: PALETTE.BORDER_INVOICE_LABEL,
    border: `1px solid ${PALETTE.BORDER_INVOICE_LABEL}`,
    borderRadius: '4em',
    color: '#fff',
    display: 'inline-block',
    fontSize: 12,
    marginBottom: 0,
    marginLeft: 8,
    padding: '1px 7px',
    textTransform: 'uppercase',
    verticalAlign: 'middle'
  }
})

interface Props {
  viewer: Invoice_viewer
}

const Invoice = (props: Props) => {
  const {viewer} = props

  const {invoiceDetails} = viewer
  const endAt = invoiceDetails && invoiceDetails.endAt
  const subject = makeMonthString(endAt)
  useDocumentTitle(`Invoice | ${subject}`)
  if (!invoiceDetails) return null

  const {
    amountDue,
    total,
    creditCard,
    lines,
    nextMonthCharges,
    startAt,
    startingBalance
  } = invoiceDetails
  const status = invoiceDetails.status as InvoiceStatusEnum
  const {nextPeriodEnd} = nextMonthCharges!
  const {brand, last4} = creditCard!
  const chargeDates = `${makeDateString(startAt)} to ${makeDateString(endAt)}`
  const nextChargesDates = `${makeDateString(endAt)} to ${makeDateString(nextPeriodEnd)}`

  return (
    <Wrap>
      <InvoiceStyles>
        <InvoiceHeader invoice={invoiceDetails} />
        <Panel>
          <InvoiceFailedStamp status={status} />
          <InvoiceTag status={status} />
          <Label>{'Invoice'}</Label>
          <Subject>{subject}</Subject>

          <SectionHeader>
            <Heading>{'Next month’s usage'}</Heading>
            <Meta>{nextChargesDates}</Meta>
          </SectionHeader>
          <NextMonthChargesLineItem item={nextMonthCharges} />

          {lines.length > 0 && (
            <>
              <SectionHeader>
                <Heading>
                  {'Last month’s adjustments'}
                  <InvoiceAsterisk />
                  <HeadingLabel>
                    <InvoiceAsterisk />
                    {'Prorated'}
                  </HeadingLabel>
                </Heading>
                <Meta>{chargeDates}</Meta>
              </SectionHeader>
              {lines.map((item) => <InvoiceLineItem key={item.id} item={item} />)}
            </>
          )}

          <AmountSection>
            {startingBalance !== 0 && (
              <div>
                <AmountLineSub>
                  <div>{'Total'}</div>
                  <div>{invoiceLineFormat(total)}</div>
                </AmountLineSub>
                <AmountLineSub>
                  <div>{'Previous Balance'}</div>
                  <div>{invoiceLineFormat(startingBalance)}</div>
                </AmountLineSub>
              </div>
            )}
            <AmountLine>
              <div>{'Amount due'}</div>
              <div>{invoiceLineFormat(amountDue)}</div>
            </AmountLine>
            {brand && (
              <Meta isError={status === InvoiceStatusEnum.FAILED}>
                {chargeStatus[status]}
                {' to '}
                <b>{brand}</b> {'ending in '}
                <b>{last4}</b>
              </Meta>
            )}
          </AmountSection>
        </Panel>
        <InvoiceFooter />
      </InvoiceStyles>
    </Wrap>
  )
}

export default createFragmentContainer(Invoice, {
  viewer: graphql`
    fragment Invoice_viewer on User {
      invoiceDetails(invoiceId: $invoiceId) {
        ...InvoiceHeader_invoice
        id
        amountDue
        creditCard {
          brand
          last4
        }
        endAt
        lines {
          ...InvoiceLineItem_item
          id
        }
        nextMonthCharges {
          ...NextMonthChargesLineItem_item
          nextPeriodEnd
        }
        startingBalance
        startAt
        status
        total
      }
    }
  `
})
