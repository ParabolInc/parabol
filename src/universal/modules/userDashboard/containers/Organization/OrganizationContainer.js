import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';
import goBackLabel from 'universal/styles/helpers/goBackLabel';
import {ORGANIZATIONS} from 'universal/utils/constants';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import appTheme from 'universal/styles/theme/appTheme';
import AdminUserRow from 'universal/modules/userDashboard/components/AdminUserRow/AdminUserRow';
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow';
import Button from 'universal/components/Button/Button';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

class OrganizationContainer extends Component {
  render() {
    const {params: {orgId}, styles} = this.props;
    return (
      <UserSettingsWrapper activeTab={ORGANIZATIONS}>
        <div className={css(styles.wrapper)}>
          <Link className={css(styles.goBackLabel)} to={`/me/organizations`} title="Back to Organizations">
            <FontAwesome name="arrow-circle-left" style={inlineBlockStyle}/>
            <div style={inlineBlockStyle}>Back to Organizations</div>
          </Link>
          <div className={css(styles.avatarAndName)}>
            <div className={css(styles.avatar)}></div>
            <div className={css(styles.orgNameAndDetails)}>
              <div className={css(styles.orgName)}>
                Parabol
              </div>
              <div className={css(styles.orgDetails)}>
                <span>12 Active Users * </span>
                <span>14 Total Users * </span>
                <span>Created October 10, 2016</span>
              </div>
            </div>
          </div>
          <div className={css(styles.adminsBlock)}>
            <div className={css(styles.adminsHeader)}>
              <span>ADMINS</span>
              <span>+ New Admin</span>
            </div>
            <div className={css(styles.listOfAdmins)}>
              <AdminUserRow preferredName="Marimar Suárez Peñalva"/>
              <AdminUserRow preferredName="Jordan Husney"/>
            </div>
          </div>
          <div className={css(styles.billingBlock)}>
            <div className={css(styles.billingHeader)}>
              BILLING INFORMATION
            </div>
            <div className={css(styles.infoAndUpdate)}>
              <div className={css(styles.creditCardInfo)}>
                <FontAwesome name="credit-card"/>
                <span className={css(styles.creditCardCompany)}>Visa</span>
                <span className={css(styles.creditCardNumber)}>**** **** **** 1234</span>
              </div>
              <Button
                colorPalette="cool"
                label="Update"
                size="small"
              />
            </div>
          </div>
          <div className={css(styles.invoiceBlock)}>
            <div className={css(styles.invoiceHeader)}>
              INVOICES
            </div>
            <div className={css(styles.listOfInvoices)}>
              <InvoiceRow preferredName="December 2016"/>
              <InvoiceRow preferredName="November 2016"/>
              <InvoiceRow preferredName="October 2016"/>
            </div>
          </div>
        </div>
      </UserSettingsWrapper >
    );
  }
}

const styleThunk = () => ({
  adminsBlock: {
    display: 'flex',
    flexDirection: 'column'
  },

  adminsHeader: {
    display: 'flex',
    justifyContent: 'space-between'
  },

  avatarAndName: {
    display: 'flex',
    margin: '1rem 0'
  },

  avatar: {
    width: 100,
    height: 100,
    background: 'black',
    borderRadius: '10%'
  },

  infoAndUpdate: {
    display: 'flex'
  },

  orgNameAndDetails: {
    color: appTheme.palette.mid,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1rem',
  },

  orgName: {
    fontSize: appTheme.typography.s8,
  },

  goBackLabel: {...goBackLabel},
  wrapper: {
    width: '60%'
  }
});

export default withStyles(styleThunk)(OrganizationContainer);
