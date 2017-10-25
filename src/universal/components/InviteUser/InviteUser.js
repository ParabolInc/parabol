import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Field, reduxForm} from 'redux-form';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import Button from 'universal/components/Button/Button';
import Editable from 'universal/components/Editable/Editable';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import inviteUserValidation from './inviteUserValidation';
import SubmissionError from 'redux-form/es/SubmissionError';

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
  placeholderColor: appTheme.palette.mid70l
};

const InviteUser = (props) => {
  const {
    atmosphere,
    dispatch,
    handleSubmit,
    styles,
    submitting,
    teamId,
    touch,
    untouch
  } = props;

  const updateEditable = async (submissionData) => {
    const schemaProps = makeSchemaProps(props);
    const schema = inviteUserValidation(schemaProps);
    const {data: {inviteTeamMember}, errors} = schema(submissionData);
    if (Object.keys(errors).length) {
      throw new SubmissionError(errors);
    }
    const invitees = [{email: inviteTeamMember}];
    InviteTeamMembersMutation(atmosphere, invitees, teamId, dispatch);
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
          label="Send Invite"
          buttonSize="small"
          onClick={handleSubmit(updateEditable)}
          waiting={submitting}
        />
      </div>
    </div>
  );
};

InviteUser.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  actions: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onInviteSubmitted: PropTypes.func,
  picture: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
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
    padding: ui.rowGutter,
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
export default withAtmosphere(
  reduxForm({form: 'inviteTeamMember', validate})(
    withStyles(styleThunk)(InviteUser)
  )
);
