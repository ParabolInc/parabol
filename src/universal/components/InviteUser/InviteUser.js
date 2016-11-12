import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Editable from 'universal/components/Editable/Editable';
import {cashay} from 'cashay';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import {reduxForm, Field} from 'redux-form';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';

const validate = ({inviteTeamMember}, {invitations, teamMembers}) => {
  const errors = {};
  const outstandingInvitationEmails = invitations.map((i) => i.email);
  if (outstandingInvitationEmails.includes(inviteTeamMember)) {
    errors.inviteTeamMember = 'That person has already been invited!';
  }
  const teamMemberEmails = teamMembers.map((i) => i.email);
  if (teamMemberEmails.includes(inviteTeamMember)) {
    errors.inviteTeamMember = 'That person is already on your team!';
  }
  return errors;
};

const InviteUser = (props) => {
  const {
    dispatch,
    handleSubmit,
    styles,
    teamId
  } = props;

  const fieldStyles = {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    placeholderColor: appTheme.palette.mid70l,
  };
  const updateEditable = (submissionData) => {
    const variables = {
      teamId,
      invitees: [{
        email: submissionData.inviteTeamMember
      }]
    };
    cashay.mutate('inviteTeamMembers', {variables});
    dispatch(showSuccess({
      title: 'Invitation sent!',
      message: `An invitation has been sent to ${submissionData.inviteTeamMember}`
    }));
  };

  return (
    <div className={css(styles.inviteUser)}>
      <AvatarPlaceholder/>
      <div className={css(styles.fieldBlock)}>
        <Field
          component={Editable}
          handleSubmit={handleSubmit(updateEditable)}
          hideIconOnValue
          name="inviteTeamMember"
          placeholder="email@domain.co"
          typeStyles={fieldStyles}
        />
      </div>
      <div className={css(styles.buttonBlock)}>
        <Button
          borderRadius=".25rem"
          colorPalette="mid"
          label="Send Invite" size="smallest"
          onClick={handleSubmit(updateEditable)}
        />
      </div>
    </div>
  );
};

InviteUser.propTypes = {
  actions: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onInviteSubmitted: PropTypes.func,
  picture: PropTypes.string,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  inviteUser: {
    alignItems: 'center',
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
  },

  fieldBlock: {
    flex: 1,
    fontSize: 0,
    padding: '0 1rem'
  },

  buttonBlock: {
    textAlign: 'right'
  }
});

/*
 * This form's redux data is automatically cleared after it is
 * submitted.
 *
 * See: universal/redux/makeReducer.js
 */
export default reduxForm({form: 'inviteTeamMember', validate})(
  withStyles(styleThunk)(InviteUser)
);
