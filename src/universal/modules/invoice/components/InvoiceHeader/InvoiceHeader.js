import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';

const InvoiceHeader = (props) => {
  const {
    contact,
    logo,
    name,
    styles
  } = props;

  return (
    <div className={css(styles.header)}>
      <div className={css(styles.logoPanel)}>
        <img alt={`Logo for ${name}`} className={css(styles.logo)} src={logo}/>
      </div>
      <div className={css(styles.info)}>
        <div className={css(styles.name)}>{name}</div>
        <div className={css(styles.contact)}>{contact}</div>
      </div>
    </div>
  );
};

InvoiceHeader.propTypes = {
  contact: PropTypes.string,
  logo: PropTypes.string,
  name: PropTypes.string,
  styles: PropTypes.object
};

InvoiceHeader.defaultProps = {
  contact: 'admin@sample.co',
  logo: defaultOrgAvatar,
  name: 'Sample Organization',
};

const breakpoint = ui.invoiceBreakpoint;
const styleThunk = () => ({
  header: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700
  },

  logoPanel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.invoiceBorderColor}`,
    borderRadius: '.5rem',
    height: 64,
    padding: '.5rem',
    width: 64,

    [breakpoint]: {
      height: 96,
      width: 96
    }
  },

  logo: {
    height: 'auto',
    width: '100%'
  },

  info: {
    flex: 1,
    marginLeft: '1.25rem',
  },

  name: {
    fontSize: appTheme.typography.s5,
    lineHeight: '1.5',

    [breakpoint]: {
      fontSize: appTheme.typography.s6
    }
  },

  contact: {
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
  }
});

export default withStyles(styleThunk)(InvoiceHeader);
