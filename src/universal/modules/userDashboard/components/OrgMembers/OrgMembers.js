import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import AdminUserRow from 'universal/modules/userDashboard/components/AdminUserRow/AdminUserRow';
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import Toggle from 'universal/components/Toggle/Toggle';

import {
  toggleLeaveModal,
  toggleRemoveModal
} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';

const OrgMembers = (props) => {
  const {
    users,
    dispatch,
    myUserId,
    styles,
  } = props;

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
          <Toggle active block label="Active"/>
        </div>
        {myUserId !== billingLeader.id &&
        <div className={css(styles.actionLink)} onClick={openRemoveModal}>
          Remove
        </div>
        }
        {users.length > 1 && myUserId === billingLeader.id &&
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
    <Panel label="Admins" controls={addNewAdmin()}>
      <div className={css(styles.listOfAdmins)}>
        {users.map((billingLeader, idx) => {
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
  );
};

const styleThunk = () => ({
  toggleBlock: {
    display: 'inline-block',
    marginLeft: ui.rowGutter,
    width: '100px'
  }
});

export default withStyles(styleThunk)(OrgMembers);
