import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createPaginationContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';
import {Menu, MenuItem} from 'universal/modules/menu';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import RemoveFromOrgModal from 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal';
import InactivateUserMutation from 'universal/mutations/InactivateUserMutation';
import SetOrgUserRoleMutation from 'universal/mutations/SetOrgUserRoleMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {BILLING_LEADER} from 'universal/utils/constants';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import OrgUserRow from '../OrgUserRow/OrgUserRow';

const originAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const OrgMembers = (props) => {
  const {
    dispatch,
    orgId,
    viewer: {orgMembers},
    relay: {environment},
    submitMutation,
    onError,
    onCompleted,
    styles
  } = props;

  const setRole = (userId, role = null) => () => {
    SetOrgUserRoleMutation(environment, orgId, userId, role);
  };

  const userRowActions = (orgUser) => {
    const {id, inactive, preferredName} = orgUser;
    const itemFactory = () => {
      const billingLeaderCount = orgMembers.edges.reduce((count, {node}) => node.isBillingLeader ? count + 1 : count, 0);
      const {userId: myUserId} = environment;
      const listItems = [];
      if (orgUser.isBillingLeader) {
        if (billingLeaderCount > 1) {
          listItems.push(
            <MenuItem label="Remove Billing Leader role" onClick={setRole(id)} />
          );
        } else {
          listItems.push(
            <MenuItem label="Have a super day!" />
          );
        }
      } else {
        listItems.push(
          <MenuItem label="Promote to Billing Leader" onClick={setRole(id, BILLING_LEADER)} />
        );
      }
      if (myUserId !== orgUser.id) {
        listItems.push(
          <RemoveFromOrgModal
            orgId={orgId}
            preferredName={preferredName}
            userId={id}
            toggle={<MenuItem label="Remove from Organization" />}
          />
        );
      }
      if (billingLeaderCount > 1 && myUserId === orgUser.id) {
        listItems.push(
          <LeaveOrgModal
            orgId={orgId}
            userId={id}
            toggle={<MenuItem label="Leave Organization" />}
          />
        );
      }

      return listItems;
    };
    const toggleHandler = () => {
      if (!inactive) {
        submitMutation();
        const handleError = (error) => {
          dispatch(showError({
            title: 'Oh no',
            message: error._error || 'Cannot pause user'
          }));
          onError(error);
        };
        InactivateUserMutation(environment, orgUser.id, handleError, onCompleted);
      } else {
        dispatch(
          showInfo({
            title: 'We got you covered',
            message: 'We’ll unpause that user the next time they log in so you don’t pay a penny more than necessary'
          })
        );
        // pop toast until we do find a way to display locally?
      }
    };
    const toggleLabel = inactive ? 'Inactive' : 'Active';
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.toggleBlock)}>
          <Toggle active={!inactive} block label={toggleLabel} onClick={toggleHandler} />
        </div>
        <div className={css(styles.menuToggleBlock)}>
          <Menu
            itemFactory={itemFactory}
            originAnchor={originAnchor}
            menuWidth="14rem"
            targetAnchor={targetAnchor}
            toggle={
              <Button
                colorPalette="dark"
                icon="ellipsis-v"
                isBlock
                size="smallest"
                buttonStyle="flat"
              />
            }
          />
        </div>
      </div>
    );
  };
  return (
    <Panel label="Organization Members">
      <div className={css(styles.listOfAdmins)}>
        {orgMembers.edges.map(({node: orgUser}) => {
          return (
            <OrgUserRow
              key={`orgUser${orgUser.email}`}
              actions={userRowActions(orgUser)}
              orgUser={orgUser}
            />
          );
        })}
      </div>
    </Panel>
  );
};

OrgMembers.propTypes = {
  relay: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  actionLinkBlock: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  menuToggleBlock: {
    marginLeft: ui.rowGutter,
    width: '1.5rem'
  },

  toggleBlock: {
    marginLeft: ui.rowGutter,
    width: '100px'
  }
});

export default createPaginationContainer(
  connect()(withMutationProps(withStyles(styleThunk)(OrgMembers))),
  graphql`
    fragment OrgMembers_viewer on User {
      orgMembers(first: $first, orgId: $orgId, after: $after) @connection(key: "OrgMembers_orgMembers") {
        edges {
          cursor
          node {
            id
            isBillingLeader(orgId: $orgId)
            email
            inactive
            picture
            preferredName
          }
        }
        pageInfo {
          hasNextPage
          endCursor
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
