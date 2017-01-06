import React, {PropTypes} from 'react';
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
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';
import ToggleNav from 'universal/components/ToggleNav/ToggleNav';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import makeDateString from 'universal/utils/makeDateString';
import EditOrgName from 'universal/modules/userDashboard/components/EditOrgName/EditOrgName';
import {toggleLeaveModal, toggleRemoveModal, togglePaymentModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import RemoveBillingLeaderModal from 'universal/modules/userDashboard/components/RemoveBillingLeaderModal/RemoveBillingLeaderModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';
import ActiveTrialCallOut from '../ActiveTrialCallOut/ActiveTrialCallOut';
import ExpiredTrialCallOut from '../ExpiredTrialCallOut/ExpiredTrialCallOut';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const initialValues = {orgName: ''};

const Organization = (props) => {
  const {
    ccLast4Digits,
    invoices,
    leaveOrgModal,
    removeBillingLeaderModal,
    modalUserId,
    modalPreferredName,
    billingLeaders,
    dispatch,
    myUserId,
    paymentModal,
    styles,
    org
  } = props;
  console.log('payyment modal', paymentModal)
  const {id: orgId, createdAt, name: orgName, picture: orgAvatar, activeUserCount, inactiveUserCount, isTrial} = org;
  initialValues.orgName = orgName;

  const openPaymentModal = () => {
    console.log('openPaymentModal')
    dispatch(togglePaymentModal());
  };

  const billingLeaderRowActions = (billingLeader) => {
    const {id, preferredName} = billingLeader;
    const openRemoveModal = () => {
      dispatch(toggleRemoveModal(id, preferredName));
    };
    const openLeaveModal = () => {
      dispatch(toggleLeaveModal(id));
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.toggleBlock)}>
          <Toggle active block label="Active" />
        </div>
        {removeBillingLeaderModal &&
        <RemoveBillingLeaderModal
          onBackdropClick={openRemoveModal}
          orgId={orgId}
          preferredName={modalPreferredName}
          userId={modalUserId}
        />
        }
        {leaveOrgModal &&
        <LeaveOrgModal
          onBackdropClick={openLeaveModal}
          orgId={orgId}
          userId={modalUserId}
        />
        }
        {myUserId !== billingLeader.id &&
        <div className={css(styles.actionLink)} onClick={openRemoveModal}>
          Remove
        </div>
        }
        {billingLeaders.length > 1 && myUserId === billingLeader.id &&
        <div className={css(styles.actionLink)} onClick={openLeaveModal}>
          Leave
        </div>
        }
      </div>
    );
  };
  const addNewAdmin = () =>
    <IconControl
      icon="plus-square-o"
      iconSize={ui.iconSize2x}
      label="New Admin"
      lineHeight={ui.iconSize2x}
      padding={`0 0 0 ${ui.panelGutter}`}
    />;
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <div className={css(styles.wrapper)}>
        <Link className={css(styles.goBackLabel)} to="/me/organizations" title="Back to Organizations">
          <FontAwesome name="arrow-circle-left" style={inlineBlockStyle}/>
          <div style={inlineBlockStyle}>Back to Organizations</div>
        </Link>
        <div className={css(styles.avatarAndName)}>
          <div className={css(styles.avatar)}>
            <div className={css(styles.avatarEditOverlay)}>
              <FontAwesome name="pencil"/>
              <span>EDIT</span>
            </div>
            <img className={css(styles.avatarImg)} height={96} width={96} src={orgAvatar || brandMark}/>
          </div>
          <div className={css(styles.orgNameAndDetails)}>
            <EditOrgName initialValues={initialValues} orgName={orgName} orgId={orgId}/>
            <div className={css(styles.orgDetails)}>
              {activeUserCount} Active Users • {inactiveUserCount} Inactive Users •
                                Created {makeDateString(createdAt, false)}
            </div>
            <ToggleNav/>
          </div>
        </div>
        <Panel label="Admins" controls={addNewAdmin()}>
          <div className={css(styles.listOfAdmins)}>
            {billingLeaders.map((billingLeader, idx) => {
              return (
                <AdminUserRow
                  key={`billingLeader${idx}`}
                  actions={billingLeaderRowActions(billingLeader)}
                  billingLeader={billingLeader}
                />
              );
            })}
          </div>
        </Panel>

        {/* TODO: bring ActiveTrialCallOut to life */}
        <ActiveTrialCallOut onClick={() => (console.log('ActiveTrialCallOut clicked'))} />

        {/* TODO: bring ExpiredTrialCallOut to life */}
        <ExpiredTrialCallOut onClick={() => (console.log('ExpiredTrialCallOut clicked'))} />

        <Panel label="Credit Card Information">
          <div className={css(styles.infoAndUpdate)}>
            <div className={css(styles.creditCardInfo)}>
              {paymentModal &&
              <CreditCardModal
                onBackdropClick={openPaymentModal}
                orgId={orgId}
              />
              }
              <FontAwesome name="credit-card"/>
              <span className={css(styles.creditCardProvider)}>Visa</span>
              <span className={css(styles.creditCardNumber)}>•••• •••• •••• {ccLast4Digits}</span>
            </div>
            <Button
              colorPalette="cool"
              label="Update"
              onClick={openPaymentModal}
              size="small"
            />
          </div>
        </Panel>
        <Panel label="Invoices">
          <div className={css(styles.listOfInvoices)}>
            {!isTrial ?
              <div className={css(styles.noInvoices)}>
                No invoices yet! Can’t beet free! Eat some beets! Betaine keeps you healthy!
              </div> :
              invoices.map((invoice) =>
                <InvoiceRow invoice={invoice}/>
              )
            }
          </div>
        </Panel>
      </div>
    </UserSettingsWrapper >
  );
};

Organization.defaultProps = {
  ccLast4Digits: '1234',
  org: {
    activeUsers: 12,
    createdAt: new Date(),
    name: 'Parabol',
    picture: brandMark,
    totalUsers: 14
  },
  invoices: [
    {
      invoiceDate: new Date(1484539569909),
      amount: 22.5,
      isEstimate: true
    },
    {
      invoiceDate: new Date(1481861169909),
      amount: 25
    },
    {
      invoiceDate: new Date(1479269976347),
      amount: 20
    }
  ]
};
const styleThunk = () => ({
  avatarAndName: {
    alignItems: 'flex-start',
    display: 'flex',
    margin: '0 0 1rem',
    maxWidth: '40rem',
    width: '100%'
  },

  avatar: {
    height: 104,
    paddingTop: 8,
    position: 'relative',
    width: 96
  },

  avatarEditOverlay: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.dark,
    borderRadius: '.5rem',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    height: 96,
    justifyContent: 'center',
    opacity: 0,
    position: 'absolute',
    width: 96,

    ':hover': {
      opacity: '.75',
      transition: 'opacity .2s ease-in',
    },
  },

  avatarImg: {
    borderRadius: '10%',
  },

  creditCardProvider: {
    margin: '0 1rem'
  },

  infoAndUpdate: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: `0 ${ui.panelGutter} ${ui.panelGutter}`
  },

  noInvoices: {
    textAlign: 'center',
    margin: '1rem'
  },

  orgDetails: {
    fontSize: appTheme.typography.s3,
    paddingBottom: '.75rem'
  },

  orgNameAndDetails: {
    color: appTheme.palette.mid,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1.5rem',
    maxWidth: '24rem',
    width: '100%'
  },

  goBackLabel: {
    ...goBackLabel,
    margin: '1rem 0'
  },

  wrapper: {
    maxWidth: '40rem'
  },

  toggleBlock: {
    display: 'inline-block',
    marginLeft: ui.rowGutter,
    width: '100px'
  }
});

export default withStyles(styleThunk)(Organization);
