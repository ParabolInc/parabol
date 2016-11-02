import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import FontAwesome from 'react-fontawesome';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';

const InviteUser = (props) => {
  const {
    onInviteSubmitted,
    styles
  } = props;

  return (
    <div className={css(styles.inviteUser)}>
      <div className={css(styles.avatarBlock)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="user" style={{position: 'relative', top: '4px'}}/>
          </div>
        </div>
      </div>
      <div className={css(styles.fieldBlock)}>
        <input
          className={css(styles.emailField)}
          placeholder="email@domain.co"
          type="text"
        />
      </div>
      <div className={css(styles.buttonBlock)}>
        <Button
          borderRadius=".25rem"
          colorPalette="mid"
          label="Send Invite" size="smallest"
          onClick={onInviteSubmitted}
        />
      </div>
    </div>
  );
};

InviteUser.propTypes = {
  actions: PropTypes.any,
  onInviteSubmitted: PropTypes.func,
  picture: PropTypes.string,
  styles: PropTypes.object
};

const avatarPlaceholderSize = '2.75rem';
const placeholderStyles = makePlaceholderStyles(appTheme.palette.mid70l);

const styleThunk = () => ({
  inviteUser: {
    alignItems: 'center',
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
  },

  avatarBlock: {
    // Define
  },

  avatarPlaceholder: {
    backgroundColor: appTheme.palette.mid50l,
    borderRadius: '100%',
    // boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${appTheme.palette.mid10a}`,
    color: appTheme.palette.mid50l,
    fontSize: ui.iconSize3x,
    height: avatarPlaceholderSize,
    lineHeight: avatarPlaceholderSize,
    padding: '1px',
    position: 'relative',
    textAlign: 'center',
    width: avatarPlaceholderSize,

    ':after': {
      border: '2px solid currentColor',
      borderRadius: '100%',
      content: '""',
      display: 'block',
      height: avatarPlaceholderSize,
      left: 0,
      position: 'absolute',
      top: 0,
      width: avatarPlaceholderSize
    }
  },

  avatarPlaceholderInner: {
    backgroundColor: '#fff',
    borderRadius: '100%',
    height: '2.625rem',
    lineHeight: '2.625rem',
    overflow: 'hidden',
    width: '2.625rem'
  },

  fieldBlock: {
    flex: 1,
    padding: '0 1rem'
  },

  buttonBlock: {
    textAlign: 'right'
  },

  emailField: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: 0,
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    outline: 'none',
    padding: 0,
    width: '100%'
  },

  ...placeholderStyles
});

export default withStyles(styleThunk)(InviteUser);
