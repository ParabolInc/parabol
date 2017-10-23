import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import shortid from 'shortid';
import Button from 'universal/components/Button/Button';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import InputField from 'universal/components/InputField/InputField';
import Panel from 'universal/components/Panel/Panel';
import Radio from 'universal/components/Radio/Radio';
import TextAreaField from 'universal/components/TextAreaField/TextAreaField';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import DropdownInput from 'universal/modules/dropdown/components/DropdownInput/DropdownInput';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import AddOrgMutation from 'universal/mutations/AddOrgMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import parseEmailAddressList from 'universal/utils/parseEmailAddressList';
import addOrgSchema from 'universal/validation/addOrgSchema';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';

const radioStyles = {
  color: ui.palette.dark
};

const validate = (values, props) => {
  const {isNewOrganization} = props;
  const schema = isNewOrganization ? addOrgSchema() : makeAddTeamSchema();
  return schema(values).errors;
};

const makeInvitees = (invitees) => {
  return invitees ? invitees.map((email) => ({
    email: email.address,
    fullName: email.fullName
  })) : [];
};

const mapStateToProps = (state) => {
  const formState = state.form.newTeam;
  if (formState) {
    const {isNewOrganization} = formState.values;
    return {isNewOrganization: isNewOrganization === 'true'};
  }
  return {};
};

class NewTeamForm extends Component {
  onSubmit = async (submittedData) => {
    const {atmosphere, dispatch, isNewOrganization, history} = this.props;
    const newTeamId = shortid.generate();
    if (isNewOrganization) {
      const schema = addOrgSchema();
      const {data: {teamName, inviteesRaw, orgName}, errors} = schema(submittedData);
      if (Object.keys(errors).length) {
        throw new SubmissionError(errors);
      }
      const parsedInvitees = parseEmailAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const newTeam = {
        id: newTeamId,
        name: teamName,
        orgId: shortid.generate()
      };
      const handleError = (err) => {
        throw new SubmissionError(err._error);
      };
      const handleCompleted = () => {
        dispatch(showSuccess({
          title: 'Organization successfully created!',
          message: `Here's your new team dashboard for ${teamName}`
        }));
        history.push(`/team/${newTeamId}`);
      };
      AddOrgMutation(atmosphere, newTeam, invitees, orgName, handleError, handleCompleted);
    } else {
      const schema = makeAddTeamSchema();
      const {data: {teamName, inviteesRaw, orgId}} = schema(submittedData);
      const parsedInvitees = parseEmailAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const variables = {
        newTeam: {
          id: newTeamId,
          name: teamName,
          orgId
        },
        invitees
      };
      await cashay.mutate('addTeam', {variables});
      dispatch(showSuccess({
        title: 'Team successfully created!',
        message: `Here's your new team dashboard for ${teamName}`
      }));
      history.push(`/team/${newTeamId}`);
    }
  };

  render() {
    const {
      handleSubmit,
      isNewOrganization,
      styles,
      submitting,
      organizations
    } = this.props;

    const controlSize = 'medium';

    return (
      <form className={css(styles.form)} onSubmit={handleSubmit(this.onSubmit)}>
        <Panel label="Create a New Team">
          <div className={css(styles.formInner)}>
            <div className={css(styles.formBlock)}>
              <FieldLabel
                fieldSize={controlSize}
                indent
                label="Add Team to…"
              />
            </div>
            <div className={css(styles.formBlock)}>
              <Field
                name="isNewOrganization"
                component={Radio}
                value="false"
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label="an existing organization:"
                type="radio"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={DropdownInput}
                  disabled={isNewOrganization}
                  fieldSize={controlSize}
                  name="orgId"
                  organizations={organizations}
                />
              </div>
            </div>
            <div className={css(styles.formBlock)}>
              <Field
                name="isNewOrganization"
                component={Radio}
                value="true"
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label="a new organization:"
                type="radio"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={InputField}
                  disabled={!isNewOrganization}
                  fieldSize={controlSize}
                  name="orgName"
                  placeholder={randomPlaceholderTheme.orgName}
                />
              </div>
            </div>
            <div className={css(styles.formBlock, styles.formBlockInline)}>
              <FieldLabel
                fieldSize={controlSize}
                htmlFor="teamName"
                indent
                inline
                label="Team Name"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={InputField}
                  fieldSize={controlSize}
                  name="teamName"
                  placeholder={randomPlaceholderTheme.teamName}
                />
              </div>
            </div>
            <div className={css(styles.textAreaBlock)}>
              <Field
                component={TextAreaField}
                fieldSize={controlSize}
                name="inviteesRaw"
                label="Invite Team Members (optional)"
                placeholder={randomPlaceholderTheme.emailMulti}
              />
            </div>
            <div className={css(styles.buttonBlock)}>
              <Button
                buttonSize="large"
                colorPalette="warm"
                depth={1}
                isBlock
                label={isNewOrganization ? 'Create Team & Org' : 'Create Team'}
                type="submit"
                waiting={submitting}
              />
            </div>
          </div>
        </Panel>
      </form>
    );
  }
}

NewTeamForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isNewOrganization: PropTypes.bool,
  styles: PropTypes.object,
  submitting: PropTypes.bool.isRequired,
  organizations: PropTypes.array.isRequired
};

const styleThunk = () => ({
  form: {
    margin: 0,
    maxWidth: '40rem',
    padding: '.5rem 2rem',
    width: '100%'
  },

  formInner: {
    borderTop: `.0625rem solid ${ui.panelBorderColor}`,
    padding: '2rem'
  },

  formBlock: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 auto 1rem',
    width: '100%'
  },

  formBlockInline: {
    marginTop: '3rem'
  },

  fieldBlock: {
    width: '16rem'
  },

  textAreaBlock: {
    margin: '2rem auto'
  },

  buttonBlock: {
    margin: '0 auto',
    width: '16rem'
  }
});

export default withAtmosphere(reduxForm({form: 'newTeam', validate})(
  connect(mapStateToProps)(
    withRouter(withStyles(styleThunk)(
      NewTeamForm)
    )
  )
)
);
