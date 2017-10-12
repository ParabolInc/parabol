import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import InvoiceHeader from '../InvoiceHeader/InvoiceHeader';
import InvoiceFooter from '../InvoiceFooter/InvoiceFooter';
import InvoiceLineItemContainer from 'universal/modules/invoice/containers/InvoiceLineItemContainer/InvoiceLineItemContainer';
import makeMonthString from 'universal/utils/makeMonthString';
import makeDateString from 'universal/utils/makeDateString';
import InvoiceLineItem from 'universal/modules/invoice/components/InvoiceLineItem/InvoiceLineItem';
import plural from 'universal/utils/plural';
import invoiceLineFormat from 'universal/modules/invoice/helpers/invoiceLineFormat';
import Tag from 'universal/components/Tag/Tag';

import {
  PAID,
  FAILED,
  PENDING,
  UPCOMING,
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS
} from 'universal/utils/constants';
import {createFragmentContainer} from 'react-relay';

const descriptionMaker = {
  [ADDED_USERS]: (quantity) => `${quantity} new ${plural(quantity, 'user')} added`,
  [REMOVED_USERS]: (quantity) => `${quantity} ${plural(quantity, 'user')} removed`,
  [INACTIVITY_ADJUSTMENTS]: () => 'Adjustments for paused users'
};

const chargeStatus = {
  [PAID]: 'Charged',
  [FAILED]: 'Failed charge',
  [PENDING]: 'Pending charge',
  [UPCOMING]: 'Will be charged'
};

const Invoice = (props) => {
  const {
    viewer,
    styles
  } = props;

  const {invoiceDetails: {
    amountDue,
    total,
    billingLeaderEmails,
    creditCard,
    picture,
    endAt,
    lines,
    nextMonthCharges,
    orgName,
    startAt,
    status,
    startingBalance
  }} = viewer;

  const {nextPeriodEnd} = nextMonthCharges;
  const {brand, last4} = creditCard;
  const subject = makeMonthString(endAt);
  // const nextMonthCharges = lines.find((line) => line.type === NEXT_MONTH_CHARGES);
  const {quantity, unitPrice} = nextMonthCharges;
  const unitPriceString = (unitPrice / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  });
  const nextUsage = {
    amount: invoiceLineFormat(nextMonthCharges.amount),
    desc: `${quantity} active ${plural(quantity, 'user')} (${unitPriceString} each)`
  };
  const chargeDates = `${makeDateString(startAt)} to ${makeDateString(endAt)}`;
  const nextChargesDates = `${makeDateString(endAt)} to ${makeDateString(nextPeriodEnd)}`;
  const makeLineItems = (arr) =>
    arr.map((item) => {
      const {id: lineId, amount, description, type, quantity: lineItemQuantity, details} = item;
      const li = {
        amount: invoiceLineFormat(amount),
        desc: description || descriptionMaker[type](lineItemQuantity),
        details,
        type
      };
      return <InvoiceLineItemContainer key={lineId} item={li} />;
    });

  const makeAsterisk = () =>
    <span className={css(styles.asterisk)}>{'*'}</span>;

  return (
    <div className={css(styles.invoice)}>
      <Helmet title={`Parabol Invoice for ${subject}`} />
      <InvoiceHeader orgName={orgName} emails={billingLeaderEmails} picture={picture} />
      <div className={css(styles.panel)}>
        {status === FAILED &&
          <div className={css(styles.failedStamp)}>
            {'Payment Failed'}
          </div>
        }
        {status === UPCOMING &&
          <div className={css(styles.tagBlock)}>
            <Tag colorPalette="light" label="Current Estimation" />
          </div>
        }
        {status === PENDING &&
          <div className={css(styles.tagBlock)}>
            <Tag colorPalette="gray" label="Payment Processing" />
          </div>
        }
        <div className={css(styles.label)}>{'Invoice'}</div>
        <div className={css(styles.subject)}>{subject}</div>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.heading)}>{'Next month’s usage'}</div>
          <div className={css(styles.meta)}>{nextChargesDates}</div>
        </div>

        <InvoiceLineItem item={nextUsage} />

        {lines.length > 0 &&
          <div className={css(styles.sectionHeader)}>
            <div className={css(styles.heading)}>
              {'Last month’s adjustments'}{makeAsterisk()}
              <div className={css(styles.headingLabel)}>
                {makeAsterisk()}{'Prorated'}
              </div>
            </div>
            <div className={css(styles.meta)}>{chargeDates}</div>
          </div>
        }
        {makeLineItems(lines)}

        <div className={css(styles.amountSection)}>
          {startingBalance !== 0 &&
            <div>
              <div className={css(styles.amountLineSub)}>
                <div>{'Total'}</div>
                <div>{invoiceLineFormat(total)}</div>
              </div>
              <div className={css(styles.amountLineSub)}>
                <div>{'Previous Balance'}</div>
                <div>{invoiceLineFormat(startingBalance)}</div>
              </div>
            </div>
          }
          <div className={css(styles.amountLine)}>
            <div>{'Amount due'}</div>
            <div>{invoiceLineFormat(amountDue)}</div>
          </div>
          {brand &&
            <div className={css(styles.meta, status === FAILED && styles.metaError)}>
              {chargeStatus[status]}{' to '}<b>{brand}</b> {'ending in '}<b>{last4}</b>
            </div>
          }
        </div>
      </div>
      <InvoiceFooter />
    </div>
  );
};

Invoice.propTypes = {
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object
};

const breakpoint = ui.invoiceBreakpoint;
const invoiceGutterSmall = '1rem';
const invoiceGutterLarge = '2rem';
const labelBreakpoint = '@media (min-width: 24rem)';
const panelGutterSmall = ui.invoicePanelGutterSmall;
const panelGutterLarge = ui.invoicePanelGutterLarge;

const styleThunk = () => ({
  invoice: {
    backgroundColor: ui.backgroundColor,
    boxShadow: '0 .125rem .25rem 0 rgba(0, 0, 0, .5)',
    color: appTheme.palette.dark,
    margin: '0 auto',
    maxWidth: '37.5rem',
    padding: invoiceGutterSmall,

    [breakpoint]: {
      margin: '2rem auto',
      padding: invoiceGutterLarge
    }
  },

  panel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.invoiceBorderColor}`,
    borderRadius: ui.borderRadiusLarge,
    margin: `${invoiceGutterSmall} 0`,
    padding: `${panelGutterSmall} 0 ${panelGutterSmall} ${panelGutterSmall}`,
    position: 'relative',

    [breakpoint]: {
      margin: `${invoiceGutterLarge} 0`,
      padding: `${panelGutterLarge} 0 ${panelGutterLarge} ${panelGutterLarge}`
    }
  },

  failedStamp: {
    color: appTheme.palette.warm,
    fontSize: '2.5rem',
    fontWeight: 700,
    left: '50%',
    opacity: 0.5,
    position: 'absolute',
    textAlign: 'center',
    textTransform: 'uppercase',
    top: '50%',
    transform: 'translate3d(-50%, -50%, 0) rotate(-30deg)',
    width: '100%',

    [breakpoint]: {
      fontSize: '3rem'
    }
  },

  tagBlock: {
    position: 'absolute',
    right: panelGutterSmall,
    top: panelGutterSmall,

    [breakpoint]: {
      right: panelGutterLarge,
      top: panelGutterLarge
    }
  },

  label: {
    color: appTheme.palette.dark50l,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  subject: {
    fontSize: '2rem',

    [breakpoint]: {
      fontSize: appTheme.typography.s7
    }
  },

  sectionHeader: {
    borderBottom: `1px solid ${ui.invoiceBorderColorLighter}`,
    marginTop: panelGutterSmall,
    paddingBottom: '.75rem',

    [breakpoint]: {
      marginTop: panelGutterLarge
    }
  },

  heading: {
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    lineHeight: '1.5',

    [breakpoint]: {
      fontSize: appTheme.typography.s6
    }
  },

  headingLabel: {
    display: 'block',
    fontSize: appTheme.typography.s3,
    lineHeight: 1,

    [labelBreakpoint]: {
      backgroundColor: appTheme.palette.dark70l,
      border: `1px solid ${appTheme.palette.dark70l}`,
      borderRadius: '4em',
      color: '#fff',
      display: 'inline-block',
      fontSize: appTheme.typography.s1,
      marginBottom: 0,
      marginLeft: '.5em',
      padding: '.0625rem .4375rem',
      textTransform: 'uppercase',
      verticalAlign: 'middle'
    }
  },

  asterisk: {
    display: 'inline-block',

    [labelBreakpoint]: {
      display: 'none'
    }
  },

  meta: {
    fontSize: appTheme.typography.s3
  },

  metaError: {
    color: appTheme.palette.warm
  },

  amountSection: {
    borderTop: `1px solid ${ui.invoiceBorderColorLighter}`,
    marginTop: '1px',
    paddingTop: '1rem',
    paddingRight: panelGutterSmall,

    [breakpoint]: {
      paddingTop: '2rem',
      paddingRight: panelGutterLarge
    }
  },

  amountLine: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    lineHeight: appTheme.typography.s7
  },

  amountLineSub: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.75rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(Invoice),
  graphql`
    fragment Invoice_viewer on User {
      invoiceDetails(invoiceId: $invoiceId) {
        id
        amountDue
        billingLeaderEmails
        creditCard {
          brand
          last4
        }
        endAt
        lines {
          id
          amount
          description
          details {
            id
            amount
            email
            endAt
            startAt
          }
          quantity
          type
        }
        nextMonthCharges {
          amount
          nextPeriodEnd
          quantity
          unitPrice
        }
        orgName
        startingBalance
        startAt
        status
        total
      }
    }
  `
);
