import React from 'react'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import makeDateString from 'universal/utils/makeDateString'
import makeMonthString from 'universal/utils/makeMonthString'
import {Link} from 'react-router-dom'
import invoiceLineFormat from 'universal/modules/invoice/helpers/invoiceLineFormat'
import {PAID, PENDING, UPCOMING} from 'universal/utils/constants'
import styled from '@emotion/styled'
import Row from 'universal/components/Row/Row'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoLink from 'universal/components/Row/RowInfoLink'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import Tag from 'universal/components/Tag/Tag'
import Icon from 'universal/components/Icon'
import {PALETTE} from 'universal/styles/paletteV2'

const FileIcon = styled(Icon)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex',
  height: 50,
  justifyContent: 'center',
  width: 50
})

const InvoiceAmount = styled('span')({
  fontSize: appTheme.typography.s6,
  color: ui.palette.dark
})

const InvoiceAvatar = styled('div')<{isEstimate: boolean}>(({isEstimate}) => ({
  backgroundColor: isEstimate ? appTheme.palette.mid : appTheme.palette.mid40l,
  borderRadius: '.5rem'
}))

const InvoiceInfo = styled(RowInfo)({
  width: '100%'
})

const InvoiceTitle = styled(RowInfoHeading)({
  display: 'inline-block',
  verticalAlign: 'middle'
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

const StyledLink = RowInfoLink.withComponent(Link)

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
  const isEstimate = status === UPCOMING
  return (
    <Row>
      <InvoiceAvatar isEstimate={isEstimate}>
        <FileIcon>receipt</FileIcon>
      </InvoiceAvatar>
      <InvoiceInfo>
        <InfoRow>
          <div>
            <InvoiceTitle>{makeMonthString(endAt)}</InvoiceTitle>
            {isEstimate && <Tag colorPalette='blue' label='Current Estimate' />}
          </div>
          <InfoRowRight>
            <InvoiceAmount>{invoiceLineFormat(amountDue)}</InvoiceAmount>
          </InfoRowRight>
        </InfoRow>
        <InfoRow>
          <div>
            <StyledLink rel='noopener noreferrer' target='_blank' to={`/invoice/${invoiceId}`}>
              {'See Details'}
            </StyledLink>
          </div>
          <InfoRowRight>
            {status === UPCOMING && (
              <StyledDate styledToPay>
                {hasCard
                  ? `card will be charged on ${makeDateString(endAt)}`
                  : `Make sure to add billing info before ${makeDateString(endAt)}!`}
              </StyledDate>
            )}
            {status === PAID && (
              <StyledDate styledPaid>
                {'Paid on '}
                {makeDateString(paidAt)}
              </StyledDate>
            )}
            {status !== PAID && status !== UPCOMING && (
              <StyledDate styledPaid={status === PENDING}>
                {'Status: '}
                {status}
              </StyledDate>
            )}
          </InfoRowRight>
        </InfoRow>
      </InvoiceInfo>
    </Row>
  )
}

export default InvoiceRow
