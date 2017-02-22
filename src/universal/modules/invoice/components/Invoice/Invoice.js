import React, {PropTypes} from 'react';
import Helmet from 'react-helmet';
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
import {
  PAID,
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS,
  OTHER_ADJUSTMENTS,
} from 'universal/utils/constants';

const demoItemsNextMonth = [
  {
    desc: '7 active users ($5 each)',
    amount: '$35.00',
    details: null
  }
];

const demoItemsLastMonth = [
  {
    desc: '3 new users added',
    amount: '$10.05',
    details: [
      {
        desc: 'matt@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      },
      {
        desc: 'taya@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      },
      {
        desc: 'terry@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      }
    ]
  },
  {
    desc: 'Adjustments for paused users',
    amount: '-$1.83',
    details: [
      {
        desc: 'amal@sample.co paused Dec 14, 2016–Dec 28, 2016',
        amount: '-$2.50'
      },
      {
        desc: 'marimar@sample.co unpaused Jan 2, 2017',
        amount: '$0.67'
      }
    ]
  }
];

const descriptionMaker = {
  [ADDED_USERS]: (quantity) => `${quantity} new users added`,
  [REMOVED_USERS]: (quantity) => `${quantity} users removed`,
  [INACTIVITY_ADJUSTMENTS]: () => 'Adjustments for paused users'
};

const Invoice = (props) => {
  const {
    invoice,
    styles
  } = props;
  const {
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
    startingBalance
  } = invoice;
  const {nextPeriodEnd} = nextMonthCharges;
  const {brand, last4} = creditCard || {};
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
  const chargeDates = `${makeDateString(startAt, false)} to ${makeDateString(endAt, false)}`;
  const nextChargesDates = `${makeDateString(endAt, false)} to ${makeDateString(nextPeriodEnd, false)}`;

  const makeLineItems = (arr) =>
    arr.map((item, idx) => {
      const li = {
        amount: invoiceLineFormat(item.amount),
        desc: item.description || descriptionMaker[item.type](item.quantity),
        details: item.details
      };
      return <InvoiceLineItemContainer key={idx} item={li}/>;
    });

  const makeAsterisk = () =>
    <span className={css(styles.asterisk)}>{'*'}</span>;

  return (
    <div className={css(styles.invoice)}>
      <Helmet title={`Parabol Action Invoice for ${subject}`}/>
      <InvoiceHeader orgName={orgName} emails={billingLeaderEmails} picture={picture}/>
      <div className={css(styles.panel)}>
        <div className={css(styles.label)}>{'Invoice'}</div>
        <div className={css(styles.subject)}>{subject}</div>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.heading)}>{'Next month’s usage'}</div>
          <div className={css(styles.meta)}>{nextChargesDates}</div>
        </div>

        <InvoiceLineItem item={nextUsage}/>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.heading)}>
            {'Last month’s adjustments'}{makeAsterisk()}
            <div className={css(styles.headingLabel)}>
              {makeAsterisk()}{'Prorated'}
            </div>
          </div>
          <div className={css(styles.meta)}>{chargeDates}</div>
        </div>

        {makeLineItems(lines)}

        <div className={css(styles.total)}>
          <div>Total</div>
          <div>{invoiceLineFormat(total)}</div>
        </div>
        <div className={css(styles.total)}>
          <div>Previous Balance</div>
          <div>{invoiceLineFormat(startingBalance)}</div>
        </div>
        <div className={css(styles.total)}>
          <div>Amount charged</div>
          <div>{invoiceLineFormat(amountDue)}</div>
        </div>
        {brand &&
          <div className={css(styles.meta)}>
            {status === PAID ? 'Charged' : 'Pending charge'} to <b>{brand}</b> ending in <b>{last4}</b>
          </div>
        }
      </div>
      <InvoiceFooter/>
    </div>
  );
};

Invoice.propTypes = {
  subject: PropTypes.string,
  styles: PropTypes.object
};

Invoice.defaultProps = {
  subject: 'February 2017'
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
      padding: invoiceGutterLarge,
    }
  },

  panel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.invoiceBorderColor}`,
    borderRadius: ui.borderRadiusLarge,
    margin: `${invoiceGutterSmall} 0`,
    padding: `${panelGutterSmall} 0 ${panelGutterSmall} ${panelGutterSmall}`,

    [breakpoint]: {
      margin: `${invoiceGutterLarge} 0`,
      padding: `${panelGutterLarge} 0 ${panelGutterLarge} ${panelGutterLarge}`,
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
      marginTop: panelGutterLarge,
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
      verticalAlign: 'middle',
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

  total: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    lineHeight: appTheme.typography.s7,
    marginTop: panelGutterSmall,
    paddingRight: panelGutterSmall,

    [breakpoint]: {
      marginTop: panelGutterLarge,
      paddingRight: panelGutterLarge
    }
  }
});

export default withStyles(styleThunk)(Invoice);
