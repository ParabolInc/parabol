import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import OrgUserRow from '../OrgUserRow/OrgUserRow';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';
import RemoveFromOrgModal from 'universal/modules/userDashboard/components/RemoveFromOrgModal/RemoveFromOrgModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import {Menu, MenuItem} from 'universal/modules/menu';
import {cashay} from 'cashay';
import {BILLING_LEADER} from 'universal/utils/constants';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';

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
    billingLeaderCount,
    dispatch,
    users,
    myUserId,
    org,
    styles,
  } = props;
  const {id: orgId} = org;

  const setRole = (userId, role = null) => () => {
    const variables = {
      orgId,
      userId,
      role
    };
    cashay.mutate('setOrgUserRole', {variables});
  };

  const userRowActions = (orgUser) => {
    const {id, inactive, preferredName} = orgUser;
    const itemFactory = () => {
      const listItems = [];
      if (orgUser.isBillingLeader) {
        if (billingLeaderCount > 1) {
          listItems.push(
            <MenuItem label="Remove Billing leader role" onClick={setRole(id)}/>
          );
        } else {
          listItems.push(
            <MenuItem label="Have a super day!"/>
          );
        }
      } else {
        listItems.push(
          <MenuItem label="Promote to Billing leader" onClick={setRole(id, BILLING_LEADER)}/>
        );
      }
      if (myUserId !== orgUser.id) {
        listItems.push(
          <RemoveFromOrgModal
            orgId={orgId}
            preferredName={preferredName}
            userId={id}
            toggle={<MenuItem label="Remove from Organization"/>}
          />
        );
      }
      if (billingLeaderCount > 1 && myUserId === orgUser.id) {
        listItems.push(
          <LeaveOrgModal
            orgId={orgId}
            userId={id}
            toggle={<MenuItem label="Leave Organization"/>}
          />
        );
      }

      return listItems;
    };
    const toggleHandler = async() => {
      if (!inactive) {
        const variables = {userId: orgUser.id};
        const {error} = await cashay.mutate('inactivateUser', {variables});
        if (error) {
          dispatch(showError({
            title: 'Oh dear...',
            message: error._error || 'Cannot pause user'
          }));
        }
      } else {
        dispatch(
          showInfo({
            title: 'We got you covered',
            message: 'We\'ll unpause that user the next time they log in so you don\'t pay a penny more than necessary'
          })
        );
        // pop toast until we do find a way to display locally?
      }
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.toggleBlock)}>
          <Toggle active={!inactive} block label="Active" onClick={toggleHandler}/>
        </div>
        <div className={css(styles.menuToggleBlock)}>
          <Menu
            itemFactory={itemFactory}
            originAnchor={originAnchor}
            menuWidth="12rem"
            targetAnchor={targetAnchor}
            toggle={
              <Button
                colorPalette="dark"
                icon="ellipsis-v"
                isBlock
                size="smallest"
                style="flat"
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
        {users.map((orgUser, idx) => {
          return (
            <OrgUserRow
              key={`orgUser${idx}`}
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
  billingLeaderCount: PropTypes.number,
  dispatch: PropTypes.func,
  users: PropTypes.array,
  myUserId: PropTypes.string,
  org: PropTypes.object,
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

export default withStyles(styleThunk)(OrgMembers);
