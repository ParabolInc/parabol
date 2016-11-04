import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import {reduxForm} from 'redux-form';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import UserRow from 'universal/components/UserRow/UserRow';

const TeamSettings = (props) => {
  const {team, teamMembers, styles} = props;
  const userRowActions = (user) => {
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.actionLink)}>
          Promote {user.preferredName} to Team Lead
        </div>
        <div className={css(styles.actionLink)}>
          Remove
        </div>
        <div className={css(styles.actionLink)}>
          Leave Team
        </div>
      </div>
    );
  };

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.inviteBlock)}>
        <InviteUser teamId={team.id}/>
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.scrollable)}>
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
  },

  actionLinkBlock: {
    fontSize: 0
  },

  actionLink: {
    color: appTheme.palette.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    marginLeft: '1.25rem',
    textDecoration: 'underline',
    verticalAlign: 'middle',

    ':hover': {
      opacity: '.5'
    }
  }
});

export default reduxForm({form: 'teamSettings'})(
  withStyles(styleThunk)(TeamSettings)
);
