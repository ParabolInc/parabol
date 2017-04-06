import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Editable from 'universal/components/Editable/Editable';
import {cashay} from 'cashay';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import {reduxForm, Field} from 'redux-form';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import inviteUserValidation from './inviteUserValidation';

const makeSchemaProps = (props) => {
  const {invitations, orgApprovals, teamMembers} = props;
  const inviteEmails = invitations.map((i) => i.email);
  const teamMemberEmails = teamMembers.map((i) => i.email);
  const orgApprovalEmails = orgApprovals.map((i) => i.email);
  return {inviteEmails, orgApprovalEmails, teamMemberEmails};
};

const validate = (values, props) => {
  const schemaProps = makeSchemaProps(props);
  const schema = inviteUserValidation(schemaProps);
  return schema(values).errors;
};

const fieldStyles = {
  color: appTheme.palette.dark,
  fontSize: appTheme.typography.s4,
  lineHeight: '1.625rem',
  placeholderColor: appTheme.palette.mid70l,
};

const InviteUser = (props) => {
  const {
    dispatch,
    handleSubmit,
    styles,
    teamId,
    touch,
    untouch
  } = props;

  const updateEditable = async (submissionData) => {
    const schemaProps = makeSchemaProps(props);
    const schema = inviteUserValidation(schemaProps);
    const {data: {inviteTeamMember}} = schema(submissionData);
    const variables = {
      teamId,
      invitees: [{
        email: inviteTeamMember
      }]
    };
    const {data: {inviteTeamMembers: inviteSent}} = await cashay.mutate('inviteTeamMembers', {variables});
    if (inviteSent === true) {
      dispatch(showSuccess({
        title: 'Invitation sent!',
        message: `An invitation has been sent to ${inviteTeamMember}`
      }));
    } else if (inviteSent === false) {
      dispatch(showSuccess({
        title: 'Request sent to admin',
        message: `A request to add ${inviteTeamMember} has been sent to your organization admin`
      }));
    } else if (inviteSent === null) {
      dispatch(showSuccess({
        title: `${inviteTeamMember} reactivated!`,
        message: `${inviteTeamMember} used to be on this team, so they were automatically approved`
      }));
    }
  };

  return (
    <div className={css(styles.inviteUser)}>
      <AvatarPlaceholder />
      <div className={css(styles.fieldBlock)}>
        <Field
          component={Editable}
          handleSubmit={handleSubmit(updateEditable)}
          hideIconOnValue
          name="inviteTeamMember"
          placeholder="email@domain.co"
          touch={touch}
          typeStyles={fieldStyles}
          untouch={untouch}
        />
      </div>
      <div className={css(styles.buttonBlock)}>
        <Button
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
  teamId: PropTypes.string,
  touch: PropTypes.func.isRequired,
  untouch: PropTypes.func.isRequired
};

const styleThunk = () => ({
  inviteUser: {
    alignItems: 'center',
    // borderBottom: `1px solid ${appTheme.palette.mid20l}`,
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
