import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import {SettingsWrapper} from 'universal/components/Settings';
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar';
import {DashNavControl} from 'universal/components';
import {TagBlock, TagPersonal, TagPro} from 'universal/components/Tag';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal';
import BillingMembersToggle from 'universal/modules/userDashboard/components/BillingMembersToggle/BillingMembersToggle';
import EditOrgName from 'universal/modules/userDashboard/components/EditOrgName/EditOrgName';
import OrgAvatarInput from 'universal/modules/userDashboard/components/OrgAvatarInput/OrgAvatarInput';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';
import {BILLING_PAGE, MEMBERS_PAGE, PERSONAL, PRO} from 'universal/utils/constants';
import makeDateString from 'universal/utils/makeDateString';

import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';

const orgBilling = () => System.import('universal/modules/userDashboard/containers/OrgBilling/OrgBillingRoot');
const orgMembers = () => System.import('universal/modules/userDashboard/containers/OrgMembers/OrgMembersRoot');

const AvatarAndName = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  margin: '0 0 1rem',
  width: '100%'
});

const OrgDetails = styled('div')({
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s7,
  paddingBottom: '.75rem'
});

const OrgNameAndDetails = styled('div')({
  color: appTheme.palette.mid,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: '1.5rem',
  width: '100%'
});

const BackControlBlock = styled('div')({
  margin: '1rem 0'
});

const StyledTagBlock = styled(TagBlock)({
  marginLeft: '.25rem',
  marginTop: '-.375rem'
});

const Organization = (props) => {
  const {history, match, orgId, viewer} = props;
  const org = viewer ? viewer.organization : {};
  const {createdAt, name: orgName, picture: orgAvatar, tier} = org;
  const pictureOrDefault = orgAvatar || defaultOrgAvatar;
  const toggle = <div><EditableAvatar hasPanel picture={pictureOrDefault} size={96} unstyled /></div>;
  const extraProps = {orgId, org};
  const goToOrgs = () => history.push('/me/organizations');

  // TODO: canNavOrgViews is true when the user is a billing leader.
  //       canNavOrgViews is true when the user is not a billing leader, and org is on the Personal tier,
  //                      so that they can see their version of the squeeze (controls to nudge BLs)
  //       canNavOrgViews is false when the user is not a billing leader, and org is on the Professional tier,
  //                      the idea being that they can see the org members read-only (no BL actions),
  //                      know who the BLs are, and leave the org on their user row.
  const canNavOrgViews = true;

  return (
    <UserSettingsWrapper>
      <Helmet title={`${orgName} | Parabol`} />
      <SettingsWrapper maxWidth="40.25rem">
        <BackControlBlock>
          <DashNavControl
            icon="arrow-circle-left"
            label="Back to Organizations"
            onClick={goToOrgs}
          />
        </BackControlBlock>
        <AvatarAndName>
          <PhotoUploadModal picture={pictureOrDefault} toggle={toggle} unstyled>
            <OrgAvatarInput orgId={orgId} />
          </PhotoUploadModal>
          <OrgNameAndDetails>
            <EditOrgName initialValues={{orgName}} orgName={orgName} orgId={orgId} />
            <OrgDetails>
              {'Created '}{makeDateString(createdAt)}
              {tier &&
                <StyledTagBlock>
                  {tier === PRO && <TagPro />}
                  {tier === PERSONAL && <TagPersonal />}
                </StyledTagBlock>
              }
            </OrgDetails>
            {canNavOrgViews && <BillingMembersToggle orgId={orgId} />}
          </OrgNameAndDetails>
        </AvatarAndName>
        <Switch>
          <AsyncRoute exact path={`${match.url}`} mod={orgBilling} extraProps={extraProps} />
          <AsyncRoute exact path={`${match.url}/${BILLING_PAGE}`} mod={orgBilling} extraProps={extraProps} />
          <AsyncRoute exact path={`${match.url}/${MEMBERS_PAGE}`} mod={orgMembers} extraProps={extraProps} />
        </Switch>
      </SettingsWrapper>
    </UserSettingsWrapper>
  );
};

Organization.propTypes = {
  match: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  history: PropTypes.object,
  viewer: PropTypes.object
};

export default createFragmentContainer(
  withRouter(Organization),
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
