import styled from '@emotion/styled'
import {Receipt} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {InvoiceRow_invoice$key} from '~/__generated__/InvoiceRow_invoice.graphql'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import {PALETTE} from '../../../../styles/paletteV3'
import makeDateString from '../../../../utils/makeDateString'
import invoiceLineFormat from '../../../invoice/helpers/invoiceLineFormat'

const InvoiceAmount = styled('span')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  lineHeight: '24px'
})

const FileIcon = styled(Receipt)<{isEstimate: boolean}>(({isEstimate}) => ({
  color: isEstimate ? PALETTE.SKY_500 : PALETTE.SLATE_600
}))

const InvoiceInfo = styled(RowInfo)({
  width: '100%'
})

const InvoiceTitle = styled(RowInfoHeading)({
  lineHeight: '24px'
})

const InfoRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const InfoRowRight = styled('div')({
  flex: 1,
  justifyContent: 'flex-end',
  textAlign: 'right'
})

const StyledDate = styled('span')<{styledToPay?: boolean; styledPaid?: boolean}>(
  ({styledToPay, styledPaid}) => ({
    fontSize: 13,
    color: styledToPay || styledPaid ? PALETTE.SLATE_600 : PALETTE.TOMATO_500
  })
)

const PayURL = styled('a')({
  color: PALETTE.SKY_500,
  fontWeight: 600,
  textDecoration: 'none'
})

interface Props {
  invoice: InvoiceRow_invoice$key
}

const InvoiceRow = (props: Props) => {
  const {invoice: invoiceRef} = props
  const invoice = useFragment(
    graphql`
      fragment InvoiceRow_invoice on Invoice {
        id
        amountDue
        creditCard {
          brand
        }
        endAt
        nextPeriodCharges {
          nextPeriodEnd
        }
        paidAt
        payUrl
        status
      }
    `,
    invoiceRef
  )
  const {
    id: invoiceId,
    amountDue,
    creditCard,
    endAt,
    nextPeriodCharges,
    paidAt,
    payUrl,
    status
  } = invoice
  const {nextPeriodEnd} = nextPeriodCharges
  const isEstimate = status === 'UPCOMING'

  return (
    <Row>
      <a
        href={payUrl || `/invoice/${invoiceId}`}
        target='_blank'
        rel='noopener noreferrer'
        className='flex w-full flex-row items-center justify-between text-slate-700 no-underline'
      >
        <FileIcon isEstimate={isEstimate} />
        <InvoiceInfo>
          <InfoRow>
            <InvoiceTitle>
              {status === 'UPCOMING'
                ? `Due on ${makeDateString(endAt)}`
                : `${makeDateString(endAt)} to ${makeDateString(nextPeriodEnd)}`}
            </InvoiceTitle>
            <InfoRowRight>
              <InvoiceAmount>
                {isEstimate && '*'}
                {invoiceLineFormat(amountDue)}
              </InvoiceAmount>
            </InfoRowRight>
          </InfoRow>
          <InfoRow>
            {status === 'UPCOMING' && (
              <StyledDate styledToPay>
                {isEstimate && '*Current estimate. '}
                {creditCard
                  ? `Card will be charged on ${makeDateString(endAt)}`
                  : `Make sure to add billing info before ${makeDateString(endAt)}!`}
              </StyledDate>
            )}
            {status === 'PAID' && (
              <StyledDate styledPaid>
                {'Paid on '}
                {makeDateString(paidAt)}
              </StyledDate>
            )}
            {status !== 'PAID' && status !== 'UPCOMING' && (
              <StyledDate styledPaid={status === 'PENDING'}>
                {payUrl ? (
                  <PayURL rel='noopener noreferrer' target='_blank' href={payUrl}>
                    {'PAY NOW'}
                  </PayURL>
                ) : (
                  `Status: ${status}`
                )}
              </StyledDate>
            )}
          </InfoRow>
        </InvoiceInfo>
      </a>
    </Row>
  )
}

export default InvoiceRow
