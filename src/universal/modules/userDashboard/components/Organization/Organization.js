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
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import makeDateString from 'universal/utils/makeDateString';
import cardSection from 'universal/styles/helpers/cardSection';
import EditOrgName from 'universal/modules/userDashboard/components/EditOrgName/EditOrgName';
import {toggleLeaveModal, toggleRemoveModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import RemoveBillingLeaderModal from 'universal/modules/userDashboard/components/RemoveBillingLeaderModal/RemoveBillingLeaderModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';

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
    styles,
    org
  } = props;
  const {id: orgId, createdAt, name: orgName, picture: orgAvatar, activeUserCount, inactiveUserCount, isTrial} = org;
  initialValues.orgName = orgName;
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
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <div className={css(styles.wrapper)}>
        <Link className={css(styles.goBackLabel)} to={`/me/organizations`} title="Back to Organizations">
          <FontAwesome name="arrow-circle-left" style={inlineBlockStyle}/>
          <div style={inlineBlockStyle}>Back to Organizations</div>
        </Link>
        <div className={css(styles.avatarAndName)}>
          <div className={css(styles.avatar)}>
            <div className={css(styles.avatarEditOverlay)}>
              <FontAwesome name="pencil"/>
              <span>EDIT</span>
            </div>
            <img className={css(styles.avatarImg)} height={100} width={100} src={orgAvatar || brandMark}/>
          </div>
          <div className={css(styles.orgNameAndDetails)}>
            <EditOrgName initialValues={initialValues} orgName={orgName} orgId={orgId}/>
            <div className={css(styles.orgDetails)}>
              {activeUserCount} Active Users • {inactiveUserCount} Inactive Users •
                                Created {makeDateString(createdAt, false)}
            </div>
          </div>
        </div>
        <div className={css(styles.orgBlock)}>
          <div className={css(styles.headerWithBorder)}>
            <div className={css(styles.headerTextBlock)}>
              <span>ADMINS</span>
              <span className={css(styles.addLeader)}>
                <FontAwesome
                  className={css(styles.addLeaderIcon)}
                  name="plus-square-o"
                  title="Promote a member to billing leader"
                />
                New Admin
              </span>
            </div>
          </div>
          <div className={css(styles.listOfAdmins)}>
            {billingLeaders.map((billingLeader, idx) => {
              return (
                <AdminUserRow
                  key={`billingLeader${idx}`}
                  actions={billingLeaderRowActions(billingLeader)}
                  billingLeader={billingLeader}
                />
              )
            })}
          </div>
        </div>
        <div className={css(styles.orgBlock)}>
          <div className={css(styles.billingHeader)}>
            <div className={css(styles.headerTextBlock)}>
              BILLING INFORMATION
            </div>
          </div>
          <div className={css(styles.infoAndUpdate)}>
            <div className={css(styles.creditCardInfo)}>
              <FontAwesome name="credit-card"/>
              <span className={css(styles.creditCardProvider)}>Visa</span>
              <span className={css(styles.creditCardNumber)}>•••• •••• •••• {ccLast4Digits}</span>
            </div>
            <Button
              colorPalette="cool"
              label="Update"
              size="small"
            />
          </div>
        </div>
        <div className={css(styles.orgBlock)}>
          <div className={css(styles.headerWithBorder)}>
            <div className={css(styles.headerTextBlock)}>
              INVOICES
            </div>
          </div>
          <div className={css(styles.listOfInvoices)}>
            {!isTrial ?
              <div className={css(styles.noInvoices)}>
                No invoices yet! Can't beet free! Eat some beets! Betaine keeps you healthy!
              </div> :
              invoices.map((invoice) =>
                <InvoiceRow invoice={invoice}/>
              )
            }
          </div>
        </div>
      </div>
    </UserSettingsWrapper >
  );
}

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
  addLeader: {
    fontSize: appTheme.typography.s5,
    color: appTheme.palette.cool,
    cursor: 'pointer'
  },

  addLeaderIcon: {
    marginRight: '.5rem'
  },

  adminsBlock: {
    display: 'flex',
    flexDirection: 'column'
  },

  avatarAndName: {
    display: 'flex',
    margin: '1rem 0'
  },

  avatar: {
    height: 100,
    width: 100
  },

  avatarEditOverlay: {
    alignItems: 'center',
    background: 'black',
    borderRadius: '10%',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 700,
    height: 100,
    justifyContent: 'center',
    opacity: 0,
    position: 'absolute',
    width: 100,
    ':hover': {
      opacity: .75
    },
  },

  avatarImg: {
    borderRadius: '10%',
  },

  creditCardProvider: {
    margin: '0 1rem'
  },

  headerTextBlock: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700,
    justifyContent: 'space-between',
    margin: '1rem'
  },

  headerWithBorder: {
    borderBottom: '1px solid #c3c5d1',
  },

  infoAndUpdate: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 1rem',

  },

  noInvoices: {
    textAlign: 'center',
    margin: '1rem'
  },

  orgBlock: {
    ...cardSection
  },
  orgDetails: {
    fontWeight: 700,
    fontSize: appTheme.typography.s3
  },

  orgNameAndDetails: {
    color: appTheme.palette.mid,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1rem',
  },

  goBackLabel: {...goBackLabel},
  wrapper: {
    width: '60%'
  }
});

export default withStyles(styleThunk)(Organization);
