import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {overflowTouch} from 'universal/styles/helpers';
import {reduxForm} from 'redux-form';
import Button from 'universal/components/Button/Button';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import UserRow from 'universal/components/UserRow/UserRow';

const TeamSettings = (props) => {
  const {teamMembers, styles} = props;
  const userRowActions = (user) => {
    const removeUser = () =>
      console.log(`remove ${user.preferredName}: ${user.id}`);
    return (
      <div>
        <Button
          borderRadius=".25rem"
          colorPalette="gray"
          label="Remove" size="smallest"
          onClick={removeUser}
        />
      </div>
    );
  };

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.inviteBlock)}>
        <InviteUser/>
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.scrollable)}>
          {
            teamMembers.map((teamMember, idx) => {
              return (
                <div key={`teamMemberKey${idx}`}>
                  <UserRow
                    {...teamMember}
                    actions={userRowActions(teamMember)}
                    key={`teamMemberKey${idx + 100}`}
                  />
                  <UserRow
                    {...teamMember}
                    actions={userRowActions(teamMember)}
                    key={`teamMemberKey${idx + 200}`}
                  />
                  <UserRow
                    {...teamMember}
                    actions={userRowActions(teamMember)}
                    key={`teamMemberKey${idx + 300}`}
                  />
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

TeamSettings.propTypes = {
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  inviteBlock: {
    maxWidth: '42rem',
    padding: '0 1rem'
  },

  body: {
    flex: 1,
    position: 'relative',
    width: '100%'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    maxWidth: '42rem',
    padding: '0 1rem 1rem',
    position: 'absolute',
    right: 0,
    top: 0,
  }
});

export default reduxForm({form: 'teamSettings'})(
  withStyles(styleThunk)(TeamSettings)
);
