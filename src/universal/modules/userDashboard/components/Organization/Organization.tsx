import {Organization_viewer} from '__generated__/Organization_viewer.graphql'
import React, {lazy} from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {Route} from 'react-router'
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router-dom'
import Avatar from 'universal/components/Avatar/Avatar'
import DashNavControl from 'universal/components/DashNavControl/DashNavControl'
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar'
import EditableOrgName from 'universal/components/EditableOrgName'
import LoadableModal from 'universal/components/LoadableModal'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import TagBlock from 'universal/components/Tag/TagBlock'
import TagPro from 'universal/components/Tag/TagPro'
import BillingMembersToggle from 'universal/modules/userDashboard/components/BillingMembersToggle/BillingMembersToggle'
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import appTheme from 'universal/styles/theme/appTheme'
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg'
import ui from 'universal/styles/ui'
import {BILLING_PAGE, MEMBERS_PAGE, PERSONAL, PRO} from 'universal/utils/constants'
import makeDateString from 'universal/utils/makeDateString'

const OrgSqueeze = lazy(() =>
  import(/* webpackChunkName: 'OrgPlanSqueeze' */ 'universal/modules/userDashboard/components/OrgPlanSqueeze/OrgPlanSqueeze')
)
const OrgBilling = lazy(() =>
  import(/* webpackChunkName: 'OrgBillingRoot' */ 'universal/modules/userDashboard/containers/OrgBilling/OrgBillingRoot')
)
const OrgMembers = lazy(() =>
  import(/* webpackChunkName: 'OrgMembersRoot' */ 'universal/modules/userDashboard/containers/OrgMembers/OrgMembersRoot')
)

const AvatarAndName = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  margin: '0 0 1rem',
  width: '100%'
})

const OrgDetails = styled('div')({
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s7,
  paddingBottom: '.75rem'
})

const OrgNameAndDetails = styled('div')({
  color: appTheme.palette.mid,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: '1.5rem',
  width: '100%'
})

const BackControlBlock = styled('div')({
  margin: '1rem 0'
})

const StyledTagBlock = styled(TagBlock)({
  marginLeft: '.25rem',
  marginTop: '-.375rem'
})

const AvatarBlock = styled('div')({
  display: 'block',
  margin: '1.5rem auto',
  width: '6rem'
})

const OrgNameBlock = styled('div')({
  color: ui.colorText,
  fontSize: appTheme.typography.s7,
  lineHeight: appTheme.typography.s8,
  placeholderColor: ui.placeholderColor
})

const OrgAvatarInput = lazy(() =>
  import(/* webpackChunkName: 'OrgAvatarInput' */ 'universal/components/OrgAvatarInput')
)

interface Props extends RouteComponentProps<{}> {
  viewer: Organization_viewer
}

const Organization = (props: Props) => {
  const {
    history,
    match,
    viewer: {organization}
  } = props
  if (!organization) {
    // trying to be somewhere they shouldn't be
    return <Redirect to='/me' />
  }
  const {orgId, createdAt, isBillingLeader, name: orgName, picture: orgAvatar, tier} = organization
  const pictureOrDefault = orgAvatar || defaultOrgAvatar
  const toggle = (
    <div>
      <EditableAvatar hasPanel picture={pictureOrDefault} size={96} unstyled />
    </div>
  )
  const goToOrgs = () => history.push('/me/organizations')
  const onlyShowMembers = !isBillingLeader && tier !== PERSONAL
  const billingMod = isBillingLeader && tier !== PERSONAL ? OrgBilling : OrgSqueeze
  return (
    <UserSettingsWrapper>
      <Helmet title={`Organization Settings | ${orgName}`} />
      <SettingsWrapper narrow>
        <BackControlBlock>
          <DashNavControl icon='arrow_back' label='Back to Organizations' onClick={goToOrgs} />
        </BackControlBlock>
        <AvatarAndName>
          {isBillingLeader ? (
            <LoadableModal
              isToggleNativeElement
              LoadableComponent={OrgAvatarInput}
              queryVars={{picture: pictureOrDefault, orgId}}
              toggle={toggle}
            />
          ) : (
            <AvatarBlock>
              <Avatar picture={pictureOrDefault} size='fill' sansRadius sansShadow />
            </AvatarBlock>
          )}
          <OrgNameAndDetails>
            {isBillingLeader ? (
              <EditableOrgName organization={organization} />
            ) : (
              <OrgNameBlock>{orgName}</OrgNameBlock>
            )}
            <OrgDetails>
              {'Created '}
              {makeDateString(createdAt)}
              {tier === PRO && (
                <StyledTagBlock>
                  <TagPro />
                </StyledTagBlock>
              )}
            </OrgDetails>
            {!onlyShowMembers && <BillingMembersToggle orgId={orgId} />}
          </OrgNameAndDetails>
        </AvatarAndName>
        {onlyShowMembers ? (
          <OrgMembers orgId={orgId} />
        ) : (
          <Switch>
            <Route exact path={`${match.url}`} component={billingMod} organization={organization} />
            <Route
              exact
              path={`${match.url}/${BILLING_PAGE}`}
              component={billingMod}
              organization={organization}
            />
            <Route
              exact
              path={`${match.url}/${MEMBERS_PAGE}`}
              component={OrgMembers}
              orgId={orgId}
            />
          </Switch>
        )}
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

export default createFragmentContainer(
  withRouter(Organization),
  graphql`
    fragment Organization_viewer on User {
      organization(orgId: $orgId) {
        ...OrgPlanSqueeze_organization
        ...EditableOrgName_organization
        orgId: id
        isBillingLeader
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
)
