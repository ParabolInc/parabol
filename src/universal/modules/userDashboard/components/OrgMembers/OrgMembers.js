import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createPaginationContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import {Button, Panel, Toggle, Tooltip} from 'universal/components';
import {Menu, MenuItem} from 'universal/modules/menu';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import RemoveFromOrgModal from 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal';
import InactivateUserMutation from 'universal/mutations/InactivateUserMutation';
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation';
import {BILLING_LEADER, PERSONAL} from 'universal/utils/constants';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import OrgUserRow from '../OrgUserRow/OrgUserRow';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const originAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};


const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
});

const MenuToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '1.5rem'
});

const ToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '6.25rem'
});

const OrgMembers = (props) => {
  const {
    dispatch,
    history,
    viewer: {organization: {orgId, orgMembers, tier}},
    relay: {environment},
    submitMutation,
    onError,
    onCompleted
  } = props;

  const isPersonalTier = tier === PERSONAL;
  const setRole = (userId, role = null) => () => {
    const variables = {orgId, userId, role};
    SetOrgUserRoleMutation(environment, variables, {dispatch, history});
  };

  const viewerIsBillingLeader = true;

  const billingLeaderCount = orgMembers.edges.reduce((count, {node}) => node.isBillingLeader ? count + 1 : count, 0);

  const userRowActions = (orgMember) => {
    const {user: {userId, inactive, preferredName}} = orgMember;
    const itemFactory = () => {
      const {userId: myUserId} = environment;
      const listItems = [];
      if (orgMember.isBillingLeader) {
        if (billingLeaderCount > 1) {
          listItems.push(
            <MenuItem label="Remove Billing Leader role" onClick={setRole(userId)} />
          );
        } else {
          listItems.push(
            <MenuItem label="Have a super day!" />
          );
        }
      } else {
        listItems.push(
          <MenuItem label="Promote to Billing Leader" onClick={setRole(userId, BILLING_LEADER)} />
        );
      }
      if (myUserId !== userId) {
        listItems.push(
          <RemoveFromOrgModal
            orgId={orgId}
            preferredName={preferredName}
            userId={userId}
            toggle={<MenuItem label="Remove from Organization" />}
          />
        );
      }
      if (billingLeaderCount > 1 && myUserId === userId) {
        listItems.push(
          <LeaveOrgModal
            orgId={orgId}
            userId={userId}
            toggle={<MenuItem label="Leave Organization" />}
          />
        );
      }

      return listItems;
    };

    const toggleHandler = () => {
      if (isPersonalTier) return;
      if (!inactive) {
        submitMutation();
        const handleError = (error) => {
          dispatch(showError({
            title: 'Oh no',
            message: error || 'Cannot pause user'
          }));
          onError(error);
        };
        InactivateUserMutation(environment, userId, handleError, onCompleted);
      } else {
        dispatch(
          showInfo({
            title: 'We’ve got you covered!',
            message: 'We’ll reactivate that user the next time they log in so you don’t pay a penny too much'
          })
        );
      }
    };
    const toggleLabel = inactive ? 'Inactive' : 'Active';
    const makeToggle = () => (<Toggle
      active={!inactive}
      block
      disabled={isPersonalTier}
      label={toggleLabel}
      onClick={toggleHandler}
    />);
    const toggleTip = (<div>{'You only need to manage activity on the Pro plan.'}</div>);
    const menuTip = (
      <div>{'You need to promote another Billing Leader'}<br />{'before you can leave this role or Organization.'}
      </div>);
    const menuButtonProps = {
      buttonSize: 'small',
      buttonStyle: 'flat',
      colorPalette: 'dark',
      icon: 'ellipsis-v',
      isBlock: true,
      size: 'smallest'
    };
    const billingLeaderActions = (
      <ActionsBlock>
        <ToggleBlock>
          {isPersonalTier ?
            <Tooltip
              tip={toggleTip}
              maxHeight={40}
              maxWidth={500}
              originAnchor={{vertical: 'top', horizontal: 'center'}}
              targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
            >
              <div>{makeToggle()}</div>
            </Tooltip> :
            makeToggle()
          }
        </ToggleBlock>
        <MenuToggleBlock>
          {(orgMember.isBillingLeader && billingLeaderCount === 1) ?
            <Tooltip
              tip={menuTip}
              maxHeight={60}
              maxWidth={500}
              originAnchor={{vertical: 'center', horizontal: 'right'}}
              targetAnchor={{vertical: 'center', horizontal: 'left'}}
            >
              {/* https://github.com/facebook/react/issues/4251 */}
              <Button {...menuButtonProps} visuallyDisabled />
            </Tooltip> :
            <Menu
              itemFactory={itemFactory}
              originAnchor={originAnchor}
              menuWidth="14rem"
              targetAnchor={targetAnchor}
              toggle={
                <Button {...menuButtonProps} />
              }
            />
          }
        </MenuToggleBlock>
      </ActionsBlock>
    );
    const viewerIsUserRow = true; // if the current user is not a BL and the current row is for this user
    const orgMemberActions = (
      <ActionsBlock>
        {viewerIsUserRow && <Button
          buttonSize="small"
          buttonStyle="flat"
          colorPalette="dark"
          label="Leave Organization"
          onClick={() => console.log('I want to leave!!!')}
        />}
      </ActionsBlock>
    );
    const actions = viewerIsBillingLeader ? billingLeaderActions : orgMemberActions;
    return actions;
  };
  return (
    <Panel label="Organization Members">
      {orgMembers.edges.map(({node: orgMember}) => {
        return (
          <OrgUserRow
            key={`orgUser${orgMember.user.email}`}
            actions={userRowActions(orgMember)}
            orgMember={orgMember}
            viewerIsBillingLeader={viewerIsBillingLeader}
          />
        );
      })}
    </Panel>
  );
};

OrgMembers.propTypes = {
  history: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  organization: PropTypes.object,
  viewer: PropTypes.object.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default createPaginationContainer(
  withRouter(connect()(withMutationProps(OrgMembers))),
  graphql`
    fragment OrgMembers_viewer on User {
      organization(orgId: $orgId) {
        orgId: id
        tier
        orgMembers(first: $first, after: $after) @connection(key: "OrgMembers_orgMembers") {
          edges {
            cursor
            node {
              ...OrgUserRow_orgMember
              isBillingLeader
              user {
                userId: id
                email
                inactive
                preferredName
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.orgMembers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      };
    },
    query: graphql`
      query OrgMembersPaginationQuery($first: Int!, $after: String, $orgId: ID!) {
        viewer {
          ...OrgMembers_viewer
        }
      }
    `
  }
);
