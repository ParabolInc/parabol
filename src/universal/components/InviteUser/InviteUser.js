import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import EditableContainer from 'universal/containers/Editable/EditableContainer.js';
import {cashay} from 'cashay';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';

const InviteUser = (props) => {
  const {
    invitations,
    onInviteSubmitted,
    styles,
    teamId
  } = props;

  const fieldStyles = {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    placeholderColor: appTheme.palette.mid70l
  };
  const updateEditable = (submissionData) => {
    const variables = {
      teamId,
      invitees: [{
        email: submissionData.inviteTeamMember
      }]
    };
    cashay.mutate('inviteTeamMembers', {variables})
  };
  const validate = ({inviteTeamMember}) => {
    const errors = {};
    const outstandingInvitationEmails = invitations.map((i) => i.email);
    if (outstandingInvitationEmails.includes(inviteTeamMember)) {
      errors.inviteTeamMember = 'That person has already been invited!'
    }
    return errors;
  };
  return (
    <div className={css(styles.inviteUser)}>
      <AvatarPlaceholder/>
      <div className={css(styles.fieldBlock)}>
        <EditableContainer
          form="inviteTeamMember"
          hideIconOnValue
          placeholder="email@domain.co"
          typeStyles={fieldStyles}
          updateEditable={updateEditable}
          validate={validate}
        />
      </div>
      <div className={css(styles.buttonBlock)}>
        <Button
          borderRadius=".25rem"
          colorPalette="mid"
          label="Send Invite" size="smallest"
          onClick={onInviteSubmitted}
        />
      </div>
    </div>
  );
};

InviteUser.propTypes = {
  actions: PropTypes.any,
  onInviteSubmitted: PropTypes.func,
  picture: PropTypes.string,
  styles: PropTypes.object
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

export default withStyles(styleThunk)(InviteUser);
