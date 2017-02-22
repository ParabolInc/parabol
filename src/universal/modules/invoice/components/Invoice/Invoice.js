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
import InvoiceLineItem from 'universal/modules/invoice/components/InvoiceLineItem/InvoiceLineItem';

import {
  NEXT_MONTH_CHARGES,
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

// <div className={css(styles.meta)}>{'Jan 7, 2017 to Feb 6, 2017'}</div>

const Invoice = (props) => {
  const {
    invoice,
    styles
  } = props;
  const {endAt, lines} = invoice;
  const subject = makeMonthString(endAt);
  const nextMonthCharges = lines.find((line) => line.type === NEXT_MONTH_CHARGES);
  const {quantity, amount} = nextMonthCharges;
  // const nextMonthItem = {
  //   desc: `${quantity} active users (${}`
  // }

  const makeLineItems = (arr) =>
    arr.map((li, idx) => <InvoiceLineItemContainer key={idx} item={li}/>);

  const makeAsterisk = () =>
    <span className={css(styles.asterisk)}>{'*'}</span>;

  return (
    <div className={css(styles.invoice)}>
      <Helmet title={`Parabol Action Invoice for ${subject}`} />
      <InvoiceHeader/>
      <div className={css(styles.panel)}>
        <div className={css(styles.label)}>{'Invoice'}</div>
        <div className={css(styles.subject)}>{subject}</div>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.heading)}>{'Next month’s usage'}</div>
        </div>

        <InvoiceLineItem item={li}/>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.heading)}>
            {'Last month’s adjustments'}{makeAsterisk()}
            <div className={css(styles.headingLabel)}>
              {makeAsterisk()}{'Prorated'}
            </div>
          </div>
          <div className={css(styles.meta)}>{'Dec 7, 2017 to Jan 6, 2017'}</div>
        </div>

        {makeLineItems(demoItemsLastMonth)}

        <div className={css(styles.total)}>
          <div>{'Total'}</div>
          <div>{'$43.22'}</div>
        </div>
        <div className={css(styles.meta)}>
          Charged to <b>Visa</b> ending in <b>3245</b>
        </div>
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
