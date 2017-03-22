import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import Avatar from 'universal/components/Avatar/Avatar';

const EditableAvatar = (props) => {
  const {hasPanel, onClick, picture, styles, unstyled} = props;
  const avatarBlockStyles = css(
    styles.avatar,
    hasPanel && styles.avatarHasPanel
  );
  return (
    <div className={avatarBlockStyles}>
      <div className={css(styles.avatarEditOverlay)} onClick={onClick}>
        <FontAwesome name="pencil" />
        <span>EDIT</span>
      </div>
      <div className={css(styles.avatarImgBlock)}>
        <Avatar picture={picture} size="fill" unstyled={unstyled} />
      </div>
    </div>
  );
};

EditableAvatar.propTypes = {
  hasPanel: PropTypes.bool,
  onClick: PropTypes.func,
  picture: PropTypes.string,
  size: PropTypes.number,
  styles: PropTypes.object,
  type: PropTypes.oneOf([
    'user',
    'team',
    'organization',
  ]),
  unstyled: PropTypes.bool
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
    zIndex: 200,

    ':hover': {
      opacity: '.75',
      transition: 'opacity .2s ease-in',
    },
  },

  avatarImgBlock: {
    height: props.hasPanel ? (props.size - 18) : props.size,
    position: 'relative',
    width: props.hasPanel ? (props.size - 18) : props.size,
    zIndex: 100
  }
});

export default withStyles(styleThunk)(EditableAvatar);
