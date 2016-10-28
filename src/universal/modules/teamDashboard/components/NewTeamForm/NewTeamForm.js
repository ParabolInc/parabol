import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import {Field, reduxForm} from 'redux-form';
import {cashay} from 'cashay';
import emailAddresses from 'email-addresses';
import shortid from 'shortid';

const NewTeamForm = (props) => {
  const {formName, handleSubmit, styles} = props;
  const onSubmit = (submittedData) => {
    const {teamName, invitedTeamMembers} = submittedData;
    const invitees = emailAddresses
      .parseAddressList(invitedTeamMembers)
      .map(email => ({
        email: email.address,
        fullName: email.fullName
      }));
    const options = {
      variables: {
        newTeam: {
          id: shortid.generate(),
          name: teamName
        },
        invitees
      }
    };
    cashay.mutate('addTeam', options);
  };
  const emailErrorText = 'Oops! Please check for valid email addresses.';
  const teamNameErrorText = 'Oops! Please add a team name.';
  return (
    <form className={css(styles.form)} onSubmit={handleSubmit(onSubmit)}>
      <h1 className={css(styles.heading)}>{formName}</h1>
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={InputField}
          hasErrorText
          helpText={teamNameErrorText}
          label="Team Name (required)"
          name="teamName"
          placeholder={randomPlaceholderTheme.teamName}
        />
      </div>
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={InputField}
          hasErrorText
          helpText={emailErrorText}
          name="invitedTeamMembers"
          label="Invite Team Members (optional)"
          placeholder={randomPlaceholderTheme.emailMulti}
          useTextarea
        />
      </div>
      <Button
        colorPalette="warm"
        isBlock
        label="Create Team"
        size="small"
        type="submit"
      />
    </form>
  );
};

NewTeamForm.propTypes = {
  formName: PropTypes.string,
  styles: PropTypes.object
};

NewTeamForm.defaultProps = {
  formName: 'Create a New Team'
};

const inlineBlock = {
  display: 'inline-block',
  verticalAlign: 'top'
};

const styleThunk = () => ({
  form: {
    margin: 0,
    maxWidth: '20rem',
    padding: 0
  },

  heading: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s6,
    fontWeight: 400,
    lineHeight: '2rem',
    margin: '0 auto 1.5rem',
    padding: `0 ${ui.fieldPaddingHorizontal}`
  },

  formBlock: {
    margin: '0 auto 2rem'
  }
});

export default reduxForm({form: 'newTeam'})(
  withStyles(styleThunk)(NewTeamForm)
);
