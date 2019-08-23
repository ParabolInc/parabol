import React from 'react'
import makeDateString from '../../../../utils/makeDateString'
import makeMonthString from '../../../../utils/makeMonthString'
import {Link} from 'react-router-dom'
import invoiceLineFormat from '../../../invoice/helpers/invoiceLineFormat'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV2'
import {InvoiceStatusEnum} from '../../../../types/graphql'

const InvoiceAmount = styled('span')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  lineHeight: '24px'
})

const FileIcon = styled(Icon)<{isEstimate: boolean}>(({isEstimate}) => ({
  color: isEstimate ? PALETTE.TEXT_BLUE : PALETTE.TEXT_LIGHT
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

const LinkStyles = styled('div')({
  color: PALETTE.TEXT_MAIN,
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'space-between',
  textDecoraction: 'none',
  width: '100%'
})

const StyledLink = LinkStyles.withComponent(Link)

const StyledDate = styled('span')<{styledToPay?: boolean, styledPaid?: boolean}>(({styledToPay, styledPaid}) => ({
  fontSize: 13,
  color: styledToPay || styledPaid ? PALETTE.TEXT_LIGHT : PALETTE.ERROR_MAIN
}))

interface Props {
  hasCard: boolean
  invoice: any
}
const InvoiceRow = (props: Props) => {
  const {
    hasCard,
    invoice: {id: invoiceId, amountDue, endAt, paidAt, status}
  } = props
  const isEstimate = status === InvoiceStatusEnum.UPCOMING
  return (
    <Row>
      <StyledLink rel='noopener noreferrer' target='_blank' to={`/invoice/${invoiceId}`}>
        <FileIcon isEstimate={isEstimate}>receipt</FileIcon>
        <InvoiceInfo>
          <InfoRow>
            <InvoiceTitle>{makeMonthString(endAt)}</InvoiceTitle>
            <InfoRowRight>
              <InvoiceAmount>{isEstimate && '*'}{invoiceLineFormat(amountDue)}</InvoiceAmount>
            </InfoRowRight>
          </InfoRow>
          <InfoRow>
            {status === InvoiceStatusEnum.UPCOMING && (
              <StyledDate styledToPay>
                {isEstimate && '*Current estimate. '}
                {hasCard
                  ? `Card will be charged on ${makeDateString(endAt)}`
                  : `Make sure to add billing info before ${makeDateString(endAt)}!`}
              </StyledDate>
            )}
            {status === InvoiceStatusEnum.PAID && (
              <StyledDate styledPaid>
                {'Paid on '}
                {makeDateString(paidAt)}
              </StyledDate>
            )}
            {status !== InvoiceStatusEnum.PAID && status !== InvoiceStatusEnum.UPCOMING && (
              <StyledDate styledPaid={status === InvoiceStatusEnum.PENDING}>
                {'Status: '}
                {status}
              </StyledDate>
            )}
          </InfoRow>
        </InvoiceInfo>
      </StyledLink>
    </Row>
  )
}

export default InvoiceRow
