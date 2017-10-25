import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Row from 'universal/components/Row/Row';
import Tag from 'universal/components/Tag/Tag';
import FontAwesome from 'react-fontawesome';
import makeDateString from 'universal/utils/makeDateString';
import makeMonthString from 'universal/utils/makeMonthString';
import {Link} from 'react-router-dom';
import invoiceLineFormat from 'universal/modules/invoice/helpers/invoiceLineFormat';
import {PAID, PENDING, UPCOMING} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const InvoiceRow = (props) => {
  const {
    hasCard,
    invoice: {
      id,
      amountDue,
      endAt,
      paidAt,
      status
    },
    styles
  } = props;
  const {id: invoiceId} = fromGlobalId(id);
  const isEstimate = status === UPCOMING;
  const invoiceAvatarStyles = css(
    styles.invoiceAvatar,
    isEstimate && styles.invoiceAvatarEstimate
  );
  const statusStyle = status === PENDING ? styles.paid : styles.unpaid;
  return (
    <Row>
      <div className={invoiceAvatarStyles}>
        <div className={css(styles.icon)}>
          <FontAwesome name="file-text" className={css(styles.fileIcon)} />
        </div>
      </div>
      <div className={css(styles.invoiceInfo)}>
        <div className={css(styles.infoRow)}>
          <div className={css(styles.infoRowLeft)}>
            <div className={css(styles.invoiceTitle)}>
              {makeMonthString(endAt)}
            </div>
            {isEstimate &&
              <Tag colorPalette="light" label="Current Estimate" />
            }
          </div>
          <div className={css(styles.infoRowRight)}>
            <span className={css(styles.invoiceAmount)}>
              {invoiceLineFormat(amountDue)}
            </span>
          </div>
        </div>
        <div className={css(styles.infoRow)}>
          <div className={css(styles.infoRowLeft)}>
            <Link className={css(styles.subHeader)} rel="noopener noreferrer" target="_blank" to={`/invoice/${invoiceId}`}>
              {'See Details'}
            </Link>
          </div>
          <div className={css(styles.infoRowRight)}>
            {status === UPCOMING &&
              <span className={css(styles.date, styles.toPay)}>
                {hasCard ? `card will be charged on ${makeDateString(endAt)}` :
                  `Make sure to add billing info before ${makeDateString(endAt)}!`
                }
              </span>
            }
            {status === PAID &&
              <span className={css(styles.date, styles.paid)}>
                {'Paid on '}{makeDateString(paidAt)}
              </span>
            }
            {status !== PAID && status !== UPCOMING &&
              <span className={css(statusStyle)}>
                {'Status: '}{status}
              </span>
            }
          </div>
        </div>
      </div>
    </Row>
  );
};

InvoiceRow.propTypes = {
  hasCard: PropTypes.bool,
  invoice: PropTypes.object,
  styles: PropTypes.object
};

const lineHeightLarge = '1.625rem';

const styleThunk = () => ({
  fileIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: 50,
    justifyContent: 'center',
    width: 50
  },

  invoiceAmount: {
    fontSize: appTheme.typography.s6,
    color: appTheme.palette.cool
  },

  invoiceAvatar: {
    backgroundColor: appTheme.palette.mid40l,
    borderRadius: '.5rem'
  },

  invoiceAvatarEstimate: {
    backgroundColor: appTheme.palette.mid
  },

  invoiceInfo: {
    paddingLeft: ui.rowGutter,
    width: '100%'
  },

  amountAndDueDate: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    textAlign: 'right'
  },

  nameAndTags: {
    // Define
  },

  date: {
    fontSize: appTheme.typography.s2
  },

  toPay: {
    color: appTheme.palette.cool,
    fontWeight: 700
  },

  paid: {
    color: appTheme.palette.mid,
    fontWeight: 700
  },

  unpaid: {
    color: appTheme.palette.warm,
    fontWeight: 700
  },
  invoiceTitle: {
    color: ui.rowHeadingColor,
    display: 'inline-block',
    fontSize: ui.rowHeadingFontSize,
    lineHeight: lineHeightLarge,
    verticalAlign: 'middle'
  },

  subHeader: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
  },

  infoRow: {
    alignItems: 'center',
    display: 'flex',
    width: '100%'
  },

  infoRowLeft: {
    // Define
  },

  infoRowRight: {
    flex: 1,
    justifyContent: 'flex-end',
    textAlign: 'right'
  },

  infoLink: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,

    ':hover': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    },
    ':focus': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(InvoiceRow);
