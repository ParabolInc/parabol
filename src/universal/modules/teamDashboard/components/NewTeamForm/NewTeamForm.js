import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';

const NewTeamForm = (props) => {
  const {formName, styles} = props;
  const handleSubmit = () => {
    console.log();
  };
  return (
    <form className={css(styles.root)} onSubmit={handleSubmit}>
      <h1 className={css(styles.heading)}>{formName}</h1>
      <div className={css(styles.formBlock)}>
        <InputField
          input={{name: 'TeamName'}}
          label="Team Name (required)"
          placeholder="Random Team Name"
        />
      </div>
      <div className={css(styles.formBlock)}>
        <InputField
          helpText={'Separate multiple emails with a comma.'}
          input={{name: 'TeamName'}}
          label="Invite Team Members (optional)"
          placeholder="Email addresses*"
          useTextarea
        />
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.buttonGroupLeft)}>
          <Button
            colorPalette="light"
            isBlock
            label="Cancel"
            size="small"
            type="button"
          />
        </div>
        <div className={css(styles.buttonGroupRight)}>
          <Button
            colorPalette="warm"
            isBlock
            label="Create Team"
            size="small"
            type="submit"
          />
        </div>
      </div>
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
  root: {
    maxWidth: '20rem'
  },

  heading: {
    color: appTheme.palette.mid,
    fontSize: '2rem',
    fontWeight: 400
  },

  formBlock: {
    margin: '2rem auto'
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
