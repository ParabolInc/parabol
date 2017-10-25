import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {Link, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar';
import TagPro from 'universal/components/Tag/TagPro';
import {tagBlock} from 'universal/components/Tag/tagBase';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal';
import BillingMembersToggle from 'universal/modules/userDashboard/components/BillingMembersToggle/BillingMembersToggle';
import EditOrgName from 'universal/modules/userDashboard/components/EditOrgName/EditOrgName';
import OrgAvatarInput from 'universal/modules/userDashboard/components/OrgAvatarInput/OrgAvatarInput';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import goBackLabel from 'universal/styles/helpers/goBackLabel';
import appTheme from 'universal/styles/theme/appTheme';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {BILLING_PAGE, MEMBERS_PAGE, PRO} from 'universal/utils/constants';
import makeDateString from 'universal/utils/makeDateString';

const orgBilling = () => System.import('universal/modules/userDashboard/containers/OrgBilling/OrgBillingRoot');
const orgMembers = () => System.import('universal/modules/userDashboard/containers/OrgMembers/OrgMembersRoot');
const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const Organization = (props) => {
  const {
    match,
    orgId,
    styles,
    viewer
  } = props;
  const org = viewer ? viewer.organization : {};
  const {createdAt, name: orgName, picture: orgAvatar, tier} = org;
  const pictureOrDefault = orgAvatar || defaultOrgAvatar;
  const toggle = <EditableAvatar hasPanel picture={pictureOrDefault} size={96} unstyled />;
  const extraProps = {orgId, org};

  return (
    <UserSettingsWrapper>
      <Helmet title={`${orgName} | Parabol`} />
      <div className={css(styles.wrapper)}>
        <Link className={css(styles.goBackLabel)} to="/me/organizations" title="Back to Organizations">
          <FontAwesome name="arrow-circle-left" style={inlineBlockStyle} />
          <div style={inlineBlockStyle}>Back to Organizations</div>
        </Link>
        <div className={css(styles.avatarAndName)}>
          <PhotoUploadModal picture={pictureOrDefault} toggle={toggle} unstyled>
            <OrgAvatarInput orgId={orgId} />
          </PhotoUploadModal>
          <div className={css(styles.orgNameAndDetails)}>
            <EditOrgName initialValues={{orgName}} orgName={orgName} orgId={orgId} />
            <div className={css(styles.orgDetails)}>
              {'Created '}{makeDateString(createdAt)}
              {tier === PRO &&
                <div className={css(styles.tagBlock)}>
                  <TagPro />
                </div>
              }
            </div>
            <BillingMembersToggle orgId={orgId} />
          </div>
        </div>
        <Switch>
          <AsyncRoute exact path={`${match.url}`} mod={orgBilling} extraProps={extraProps} />
          <AsyncRoute exact path={`${match.url}/${BILLING_PAGE}`} mod={orgBilling} extraProps={extraProps} />
          <AsyncRoute exact path={`${match.url}/${MEMBERS_PAGE}`} mod={orgMembers} extraProps={extraProps} />
        </Switch>
      </div>
    </UserSettingsWrapper>
  );
};

Organization.propTypes = {
  match: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  styles: PropTypes.object,
  viewer: PropTypes.object
};

const styleThunk = () => ({
  avatarAndName: {
    alignItems: 'flex-start',
    display: 'flex',
    margin: '0 0 1rem',
    maxWidth: '40rem',
    width: '100%'
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
    lineHeight: appTheme.typography.s7,
    paddingBottom: '.75rem'
  },

  orgNameAndDetails: {
    color: appTheme.palette.mid,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1.5rem',
    maxWidth: '24.875rem',
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
  },

  tagBlock: {
    ...tagBlock,
    marginLeft: '.25rem',
    marginTop: '-.375rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(Organization),
  graphql`
    fragment Organization_viewer on User {
      organization(orgId: $orgId) {
        id
        createdAt
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        creditCard {
          brand
          expiry
          last4
        }
        periodStart
        periodEnd
        tier
      }
    }
  `
);
