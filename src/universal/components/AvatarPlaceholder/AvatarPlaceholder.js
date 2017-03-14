import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';

const AvatarPlaceholder = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.avatarBlock)}>
      <div className={css(styles.avatarPlaceholder)}>
        <div className={css(styles.avatarPlaceholderInner)}>
          <FontAwesome name="user" style={{position: 'relative', top: '4px'}} />
        </div>
      </div>
    </div>
  );
};

AvatarPlaceholder.propTypes = {
  styles: PropTypes.object
};

const avatarPlaceholderSize = '2.75rem';
const styleThunk = () => ({
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
  }
});

export default withStyles(styleThunk)(AvatarPlaceholder);
