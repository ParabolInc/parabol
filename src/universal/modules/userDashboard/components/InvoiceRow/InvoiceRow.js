import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Row from 'universal/components/Row/Row';
import UserTag from 'universal/components/UserTag/UserTag';
import FontAwesome from 'react-fontawesome';
import makeDateString from 'universal/utils/makeDateString';

const InvoiceRow = (props) => {
  const {
    invoice: {
      invoiceDate,
      isEstimate,
      amount
    },
    styles
  } = props;
  return (
    <Row>
      <div className={css(styles.invoiceAvatar)}>
        <div className={css(styles.icon)}>
          <div className={css(styles.iconBackdrop)}></div>
          <FontAwesome name="file-text-o" className={css(styles.fileIcon)}/>
        </div>
      </div>
      <div className={css(styles.invoiceInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.preferredName)}>
            {makeDateString(invoiceDate, false)}
          </div>
          {isEstimate &&
            <UserTag colorPalette="light" label="Current Estimate"/>
          }
        </div>
        <div className={css(styles.subHeader)}>
          See Details
        </div>
      </div>
      <div className={css(styles.amountAndDueDate)}>
        <span className={css(styles.invoiceAmount)}>
          ${amount.toFixed(2)}
        </span>
        <span className={css(styles.dueDate)}>
          {isEstimate ?
            <span>
              Your card will be charged on {makeDateString(invoiceDate, false)}
            </span> :
            <span className={css(styles.paid)}>
              Paid on {makeDateString(invoiceDate, false)}
            </span>
          }
        </span>
      </div>
    </Row>
  );
};

InvoiceRow.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  iconBackdrop: {
    background: appTheme.palette.dark,
    borderRadius: '10%',
    height: 50,
    opacity: '.5',
    position: 'absolute',
    width: 50
  },

  fileIcon: {
    alignItems: 'center',
    display: 'flex',
    fontSize: appTheme.typography.s7,
    height: 50,
    justifyContent: 'center',
    width: 50
  },

  invoiceAmount: {
    fontSize: appTheme.typography.s7,
    color: appTheme.palette.cool,
  },

  invoiceAvatar: {
    // Define
  },

  invoiceInfo: {
    paddingLeft: '1rem'
  },

  amountAndDueDate: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginRight: '1rem',
    textAlign: 'right'
  },

  nameAndTags: {
    // Define
  },

  paid: {
    color: appTheme.palette.cool
  },

  preferredName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },

  subHeader: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
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
