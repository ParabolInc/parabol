import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import {DashContent, DashHeader, DashHeaderInfo} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import {Field} from 'redux-form';
import {ACTIVITY_WELCOME} from 'universal/modules/userDashboard/ducks/settingsDuck';

const renderActivity = (activity) => {
  if (activity === ACTIVITY_WELCOME) {
    return (
      <div>
        Hey, welcome aboard! In order for your team to recognize who you
        are, do you mind telling us your name?
      </div>
    );
  }
  return null;
};

const UserSettings = (props) => {
  const {activity, handleSubmit, onSubmit, styles} = props;
  return (
    <form className={css(styles.root)} onSubmit={handleSubmit(onSubmit)}>
      <DashHeader>
        <DashHeaderInfo title="My Settings"/>
      </DashHeader>
      <DashContent>
        <div className={css(styles.body)}>
          <div className={css(styles.row)}>
            {renderActivity(activity)}
          </div>
          <div className={css(styles.row)}>
            <div className={css(styles.label)}>
              Name
            </div>
            <Field
              autoFocus
              component={InputField}
              hasShortcutHint
              name="preferredName"
              placeholder="Albert Einstein"
              type="text"
            />
          </div>
          <Button
            isBlock
            label="Update"
            size="small"
            colorPalette="cool"
            type="submit"
          />
        </div>
      </DashContent>
    </form>
  );
};

UserSettings.propTypes = {
  activity: PropTypes.string,          // from settingsDuck
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  nextPage: PropTypes.string,          // from settingsDuck
  onSubmit: PropTypes.func,
  router: PropTypes.object,
  userId: PropTypes.string,
  /* User for form defaults: */
  preferredName: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  },

  body: {
    maxWidth: '20rem'
  },

  row: {
    margin: '0 0 1.5rem'
  },

  label: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    margin: '0 0 .5rem',
    padding: '0 0 0 .5rem',
    textTransform: 'uppercase'
  }
});

export default withStyles(styleThunk)(UserSettings);
