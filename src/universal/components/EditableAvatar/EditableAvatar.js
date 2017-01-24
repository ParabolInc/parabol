import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import FontAwesome from 'react-fontawesome';

const EditableAvatar = (props) => {
  const {hasPanel, onClick, picture, styles} = props;
  const fallbackImage = hasPanel ? defaultUserAvatar : defaultOrgAvatar;
  const avatarBlockStyles = css(
    styles.avatar,
    hasPanel && styles.avatarHasPanel
  );
  return (
    <div className={avatarBlockStyles}>
      <div className={css(styles.avatarEditOverlay)} onClick={onClick}>
        <FontAwesome name="pencil"/>
        <span>EDIT</span>
      </div>
      <img className={css(styles.avatarImg)} src={picture || fallbackImage}/>
    </div>
  );
};

EditableAvatar.propTypes = {
  hasPanel: PropTypes.bool,
  onClick: PropTypes.func,
  picture: PropTypes.string,
  size: PropTypes.number,
  styles: PropTypes.object
};

const borderRadius = '50%';
const borderRadiusPanel = ui.panelBorderRadius;

const styleThunk = (theme, props) => ({
  avatar: {
    height: props.size,
    position: 'relative',
    width: props.size
  },

  avatarHasPanel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.panelBorderColor}`,
    padding: '.5rem',
    borderRadius: props.hasPanel ? borderRadiusPanel : borderRadius,
  },

  avatarEditOverlay: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.dark,
    borderRadius: props.hasPanel ? borderRadiusPanel : borderRadius,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    height: props.size,
    justifyContent: 'center',
    left: props.hasPanel ? '-1px' : 0,
    opacity: 0,
    position: 'absolute',
    top: props.hasPanel ? '-1px' : 0,
    width: props.size,

    ':hover': {
      opacity: '.75',
      transition: 'opacity .2s ease-in',
    },
  },

  avatarImg: {
    borderRadius: props.hasPanel ? 0 : borderRadius,
    boxShadow: props.hasPanel ? 'none' : ui.avatarDefaultBoxShadow,
    height: props.hasPanel ? (props.size - 18) : props.size,
    width: props.hasPanel ? (props.size - 18) : props.size
  }
});

export default withStyles(styleThunk)(EditableAvatar);
