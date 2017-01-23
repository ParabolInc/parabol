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
import BillingMembersToggle from 'universal/modules/userDashboard/components/BillingMembersToggle/BillingMembersToggle';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import makeDateString from 'universal/utils/makeDateString';
import EditOrgName from 'universal/modules/userDashboard/components/EditOrgName/EditOrgName';
import OrgBillingContainer from 'universal/modules/userDashboard/containers/OrgBilling/OrgBillingContainer';
import OrgMembersContainer from 'universal/modules/userDashboard/containers/OrgMembers/OrgMembersContainer';
import {BILLING_PAGE, toggleAvatarModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import SettingsModal from 'universal/modules/userDashboard/components/SettingsModal/SettingsModal';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const initialValues = {orgName: ''};

const Organization = (props) => {
  const {
    activeOrgDetail,
    dispatch,
    styles,
    org
  } = props;
  const {id: orgId, createdAt, name: orgName, picture: orgAvatar, activeUserCount, inactiveUserCount} = org;
  initialValues.orgName = orgName;
  const OrgSection = activeOrgDetail === BILLING_PAGE ? OrgBillingContainer : OrgMembersContainer;
  const openChangeAvatar = () => {
    dispatch(toggleAvatarModal());
  };
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <SettingsModal {...props}/>
      <div className={css(styles.wrapper)}>
        <Link className={css(styles.goBackLabel)} to="/me/organizations" title="Back to Organizations">
          <FontAwesome name="arrow-circle-left" style={inlineBlockStyle}/>
          <div style={inlineBlockStyle}>Back to Organizations</div>
        </Link>
        <div className={css(styles.avatarAndName)}>
          <div className={css(styles.avatar)}>
            <div className={css(styles.avatarEditOverlay)} onClick={openChangeAvatar}>
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
            <BillingMembersToggle orgId={orgId} activeOrgDetail={activeOrgDetail}/>
          </div>
        </div>
        <OrgSection orgId={orgId}/>
      </div>
    </UserSettingsWrapper >
  );
};

Organization.defaultProps = {
  org: {
    activeUsers: 12,
    createdAt: new Date(),
    name: 'Parabol',
    picture: brandMark,
    totalUsers: 14
  }
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
