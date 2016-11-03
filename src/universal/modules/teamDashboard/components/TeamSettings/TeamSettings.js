import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import {reduxForm} from 'redux-form';
import Button from 'universal/components/Button/Button';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import UserRow from 'universal/components/UserRow/UserRow';

const TeamSettings = (props) => {
  const {teamMembers, styles} = props;
  console.dir(teamMembers);
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
      <div className={css(styles.body)}>
        <InviteUser/>
        {
          teamMembers.map((teamMember, idx) => {
            return (
              <UserRow
                {...teamMember}
                actions={userRowActions(teamMember)}
                key={`teamMemberKey${idx}`}
              />
            );
          })
        }
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
    padding: '1rem',
    width: '100%'
  },

  body: {
    maxWidth: '40rem'
  }
});

export default reduxForm({form: 'teamSettings'})(
  withStyles(styleThunk)(TeamSettings)
);
