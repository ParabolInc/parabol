import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import invoiceLineFormat from 'universal/modules/invoice/helpers/invoiceLineFormat';
import {
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS
} from 'universal/utils/constants';
import makeDateString from 'universal/utils/makeDateString';

const detailDescriptionMaker = {
  [ADDED_USERS]: (detail) => `${detail.email} joined ${makeDateString(detail.startAt)}`,
  [REMOVED_USERS]: (detail) => `${detail.email} left ${makeDateString(detail.startAt)}`,
  [INACTIVITY_ADJUSTMENTS]: (detail) => {
    if (!detail.endAt) {
      return `${detail.email} has been paused since ${makeDateString(detail.startAt)}`;
    } else if (!detail.startAt) {
      return `${detail.email} was paused until ${makeDateString(detail.startAt)}`;
    }
    return `${detail.email} was paused from ${makeDateString(detail.startAt)} to ${makeDateString(detail.endAt)}`;
  }
};

const InvoiceLineItem = (props) => {
  const {
    detailsOpen,
    detailsToggle,
    item,
    styles
  } = props;

  const {type} = item;

  const detailsInnerStyles = css(
    styles.detailsInner,
    detailsOpen && styles.detailsOpen
  );

  const makeToggle = () => {
    const label = detailsOpen ? 'Hide Details' : 'View Details';
    return (
      <div className={css(styles.detailsToggle)} onClick={detailsToggle}>{label}</div>
    );
  };

  const makeDetails = (details) => {
    return details.map((d) => {
      const amount = invoiceLineFormat(d.amount);
      const description = detailDescriptionMaker[type](d);
      return (
        <div className={css(styles.detailsItem)} key={d.id}>
          <div className={css(styles.fill)}>{description}</div>
          <div>{amount}</div>
        </div>
      );
    });
  };

  return (
    <div className={css(styles.item)}>
      <div className={css(styles.itemContent)}>
        <div className={css(styles.fill)}>{item.desc}</div>
        <div>{item.amount}</div>
      </div>
      {item.details &&
        <div className={`${css(styles.details)} hide-print`}>
          {makeToggle()}
          <div className={detailsInnerStyles}>
            {makeDetails(item.details)}
          </div>
        </div>
      }
    </div>
  );
};

InvoiceLineItem.propTypes = {
  detailsOpen: PropTypes.bool,
  detailsToggle: PropTypes.func,
  item: PropTypes.object,
  styles: PropTypes.object
};

const breakpoint = ui.invoiceBreakpoint;
const styleThunk = () => ({
  item: {
    borderBottom: `1px solid ${ui.invoiceBorderColorLighter}`,
    display: 'block',
    paddingBottom: '.625rem',
    paddingTop: '.625rem'
  },

  itemContent: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.sBase,
    lineHeight: '1.5',
    paddingRight: ui.invoicePanelGutterSmall,

    [breakpoint]: {
      fontSize: appTheme.typography.s5,
      paddingRight: ui.invoicePanelGutterLarge
    }
  },

  fill: {
    flex: 1,
    paddingRight: '1em'
  },

  details: {
    display: 'block'
  },

  detailsToggle: {
    color: appTheme.palette.cool,
    cursor: 'pointer',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    textTransform: 'uppercase'
  },

  detailsInner: {
    display: 'none'
  },

  detailsOpen: {
    display: 'block'
  },

  detailsItem: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.s2,
    lineHeight: '1.375rem',
    paddingRight: ui.invoicePanelGutterSmall,

    [breakpoint]: {
      paddingRight: ui.invoicePanelGutterLarge
    }
  }
});

export default withStyles(styleThunk)(InvoiceLineItem);
