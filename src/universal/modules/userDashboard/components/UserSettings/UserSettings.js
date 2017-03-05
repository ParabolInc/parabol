import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import Panel from 'universal/components/Panel/Panel';
import {Field} from 'redux-form';
import {ACTIVITY_WELCOME} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {randomPreferredName} from 'universal/utils/makeRandomPlaceholder';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {SETTINGS} from 'universal/utils/constants';
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar';
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal';
import UserAvatarInput from 'universal/modules/userDashboard/components/UserAvatarInput/UserAvatarInput';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';

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
  const {activity, handleSubmit, onSubmit, styles, user: {id: userId, picture}} = props;
  const pictureOrDefault = picture || defaultUserAvatar;
  const toggle = <EditableAvatar picture={pictureOrDefault} size={96}/>;
  return (
    <UserSettingsWrapper settingsLocation={SETTINGS}>
      <div className={css(styles.body)}>
        <Panel label="My Information">
          <form className={css(styles.form)} onSubmit={handleSubmit(onSubmit)}>
            <div className={css(styles.avatarBlock)}>
              <PhotoUploadModal picture={pictureOrDefault} toggle={toggle}>
                <UserAvatarInput userId={userId}/>
              </PhotoUploadModal>
            </div>
            <div className={css(styles.infoBlock)}>
              <div className={css(styles.block)}>
                {renderActivity(activity)}
              </div>
              <div className={css(styles.block)}>
                {/* TODO: Make me Editable.js (TA) */}
                <Field
                  autoFocus
                  colorPalette="gray"
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
            </div>
          </form>
        </Panel>
      </div>
    </UserSettingsWrapper>
  );
};

UserSettings.propTypes = {
  activity: PropTypes.string,          // from settingsDuck
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  nextPage: PropTypes.string,          // from settingsDuck
  onSubmit: PropTypes.func,
  router: PropTypes.object,
  user: PropTypes.shape({
    email: PropTypes.string,
    id: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string,
  }),
  userId: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  body: {
    maxWidth: '37.5rem',
  },

  form: {
    borderTop: `1px solid ${ui.rowBorderColor}`,
    display: 'flex',
    padding: ui.panelGutter,
    width: '100%'
  },

  block: {
    fontSize: '1rem',
    margin: '0 0 1.5rem'
  },

  avatarBlock: {
    // Define
  },

  infoBlock: {
    paddingLeft: ui.panelGutter
  }
});

export default withStyles(styleThunk)(UserSettings);
