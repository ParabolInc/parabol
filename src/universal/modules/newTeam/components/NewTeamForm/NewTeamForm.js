import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import {Field, reduxForm} from 'redux-form';
import DropdownInput from 'universal/modules/dropdown/components/DropdownInput/DropdownInput';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';

const validate = (values) => {
  const schema = makeAddTeamSchema();
  return schema(values).errors;
};

const NewTeamForm = (props) => {
  const {handleSubmit, organizations, styles} = props;
  return (
    <form className={css(styles.form)} onSubmit={handleSubmit}>
      <h1 className={css(styles.heading)}>Create a New Team</h1>
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={DropdownInput}
          label="Add Team to..."
          name="orgId"
          organizations={organizations}
        />
        <Field
          colorPalette="gray"
          component={InputField}
          label="Team Name (required)"
          name="teamName"
          placeholder={randomPlaceholderTheme.teamName}
        />
      </div>
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={InputField}
          name="inviteesRaw"
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
  styles: PropTypes.object
};

const styleThunk = () => ({
  form: {
    margin: 0,
    maxWidth: '20rem',
    padding: '2rem'
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

export default reduxForm({form: 'newTeam', validate})(withStyles(styleThunk)(NewTeamForm));
