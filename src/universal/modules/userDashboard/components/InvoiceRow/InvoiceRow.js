import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {Row, RowInfo, Tag} from 'universal/components';
import makeDateString from 'universal/utils/makeDateString';
import makeMonthString from 'universal/utils/makeMonthString';
import {Link} from 'react-router-dom';
import invoiceLineFormat from 'universal/modules/invoice/helpers/invoiceLineFormat';
import {PAID, PENDING, UPCOMING} from 'universal/utils/constants';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import styled, {css, cx} from 'react-emotion';

const FileIcon = styled(StyledFontAwesome)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex',
  fontSize: ui.iconSize2x,
  height: 50,
  justifyContent: 'center',
  width: 50
});

const InvoiceAmount = styled('span')({
  fontSize: appTheme.typography.s6,
  color: ui.palette.dark
});

const InvoiceAvatar = styled('div')(({isEstimate}) => ({
  backgroundColor: isEstimate ? appTheme.palette.mid : appTheme.palette.mid40l,
  borderRadius: '.5rem'
}));

const InvoiceInfo = styled(RowInfo)({
  width: '100%'
});

const InvoiceTitle = styled('div')({
  color: ui.rowHeadingColor,
  display: 'inline-block',
  fontSize: ui.rowHeadingFontSize,
  lineHeight: '1.625rem',
  verticalAlign: 'middle'
});

const InfoRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
});

const InfoRowRight = styled('div')({
  flex: 1,
  justifyContent: 'flex-end',
  textAlign: 'right'
});

const styledDate = css({
  fontSize: appTheme.typography.s2
});

const styledToPay = css({
  color: ui.palette.dark
});

const styledPaid = css({
  color: ui.hintColor
});

const styledUnpaid = css({
  color: appTheme.palette.warm
});

const styledInfoLink = css({
  ...ui.rowSubheading,
  color: appTheme.palette.mid,
  ':hover, :focus': {
    color: appTheme.palette.mid,
    textDecoration: 'underline'
  }
});

const InvoiceRow = (props) => {
  const {
    hasCard,
    invoice: {
      id: invoiceId,
      amountDue,
      endAt,
      paidAt,
      status
    }
  } = props;
  const isEstimate = status === UPCOMING;
  return (
    <Row>
      <InvoiceAvatar isEstimate={isEstimate}>
        <FileIcon name="file-text" />
      </InvoiceAvatar>
      <InvoiceInfo>
        <InfoRow>
          <div>
            <InvoiceTitle>
              {makeMonthString(endAt)}
            </InvoiceTitle>
            {isEstimate &&
              <Tag colorPalette="blue" label="Current Estimate" />
            }
          </div>
          <InfoRowRight>
            <InvoiceAmount>
              {invoiceLineFormat(amountDue)}
            </InvoiceAmount>
          </InfoRowRight>
        </InfoRow>
        <InfoRow>
          <div>
            <Link className={styledInfoLink} rel="noopener noreferrer" target="_blank" to={`/invoice/${invoiceId}`}>
              {'See Details'}
            </Link>
          </div>
          <InfoRowRight>
            {status === UPCOMING &&
              <span className={cx(styledDate, styledToPay)}>
                {hasCard ? `card will be charged on ${makeDateString(endAt)}` :
                  `Make sure to add billing info before ${makeDateString(endAt)}!`
                }
              </span>
            }
            {status === PAID &&
              <span className={cx(styledDate, styledPaid)}>
                {'Paid on '}{makeDateString(paidAt)}
              </span>
            }
            {status !== PAID && status !== UPCOMING &&
              <span className={status === PENDING ? styledPaid : styledUnpaid}>
                {'Status: '}{status}
              </span>
            }
          </InfoRowRight>
        </InfoRow>
      </InvoiceInfo>
    </Row>
  );
};

InvoiceRow.propTypes = {
  hasCard: PropTypes.bool,
  invoice: PropTypes.object
};

export default InvoiceRow;
