import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import InputField from 'universal/components/InputField/InputField';

const NewTeamForm = (props) => {
  const {formName, styles} = props;
  const handleSubmit = () => {
    console.log();
  };
  const buttonDisabled = true;
  const buttonLabel = buttonDisabled ? 'Create Team*' : 'Create Team';
  return (
    <div className={css(styles.root)}>
      <form className={css(styles.form)} onSubmit={handleSubmit}>
        <h1 className={css(styles.heading)}>{formName}</h1>
        <div className={css(styles.formBlock)}>
          <InputField
            colorPalette="gray"
            input={{name: 'TeamName'}}
            label="Team Name (required)"
            placeholder="Random Team Name"
          />
        </div>
        <div className={css(styles.formBlock)}>
          <InputField
            colorPalette="gray"
            helpText={'*Separate multiple emails with a comma.'}
            input={{name: 'InviteTeamMembers'}}
            label="Invite Team Members (optional)"
            placeholder="Email addresses*"
            useTextarea
          />
        </div>
        <div className={css(styles.buttonGroup)}>
          <div className={css(styles.buttonGroupLeft)}>
            <Button
              colorPalette="gray"
              isBlock
              label="Cancel"
              size="small"
            />
          </div>
          <div className={css(styles.buttonGroupRight)}>
            <Button
              colorPalette="warm"
              isBlock
              disabled={buttonDisabled}
              label={buttonLabel}
              size="small"
              type="submit"
            />
            {buttonDisabled &&
              <FieldHelpText align="center" helpText="*Disabled (add Team Name)" resetPadding />
            }
          </div>
        </div>
      </form>
    </div>
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
  root: {
    '@media screen and (min-width: 48rem)': {
      borderLeft: `.25rem solid ${appTheme.palette.mid50l}`,
      margin: '2rem 0',
      padding: '0 2rem'
    }
  },

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
  },

  buttonGroup: {
    fontSize: 0
  },

  buttonGroupLeft: {
    ...inlineBlock,
    paddingRight: '.75rem',
    width: '35%'
  },

  buttonGroupRight: {
    ...inlineBlock,
    paddingLeft: '.75rem',
    width: '65%'
  }
});

export default withStyles(styleThunk)(NewTeamForm);
