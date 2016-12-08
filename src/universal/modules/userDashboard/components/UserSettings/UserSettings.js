import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import {Field} from 'redux-form';
import {ACTIVITY_WELCOME} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {randomPreferredName} from 'universal/utils/makeRandomPlaceholder';

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
    <div className={css(styles.body)}>
      <div className={css(styles.row)}>
        {renderActivity(activity)}
      </div>
      <form className={css(styles.root)} onSubmit={handleSubmit(onSubmit)}>
        <div className={css(styles.row)}>
          <Field
            autoFocus
            component={InputField}
            label="Name"
            name="preferredName"
            placeholder={randomPreferredName}
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
      </form>
    </div>
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
  }
});

export default withStyles(styleThunk)(UserSettings);
