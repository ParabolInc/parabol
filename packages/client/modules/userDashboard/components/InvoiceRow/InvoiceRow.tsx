import React from 'react'
import ui from '../../../../styles/ui'
import appTheme from '../../../../styles/theme/appTheme'
import makeDateString from '../../../../utils/makeDateString'
import makeMonthString from '../../../../utils/makeMonthString'
import {Link} from 'react-router-dom'
import invoiceLineFormat from '../../../invoice/helpers/invoiceLineFormat'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import Tag from '../../../../components/Tag/Tag'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV2'
import {InvoiceStatusEnum} from '../../../../types/graphql'

const FileIcon = styled(Icon)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex',
  height: 50,
  justifyContent: 'center',
  width: 50
})

const InvoiceAmount = styled('span')({
  fontSize: 24,
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
  const isEstimate = status === InvoiceStatusEnum.UPCOMING
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
            {status === InvoiceStatusEnum.UPCOMING && (
              <StyledDate styledToPay>
                {hasCard
                  ? `card will be charged on ${makeDateString(endAt)}`
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
          </InfoRowRight>
        </InfoRow>
      </InvoiceInfo>
    </Row>
  )
}

export default InvoiceRow
