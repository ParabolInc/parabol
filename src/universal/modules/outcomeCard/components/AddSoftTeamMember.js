import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';

const iconStyle = {
  color: 'inherit',
  fontSize: ui.iconSize,
  lineHeight: 'inherit',
  marginLeft: ui.menuGutterHorizontal,
  marginRight: ui.menuGutterInner,
  textAlign: 'center',
  width: '1.25rem'
};

class AddSoftTeamMember extends Component {
  render() {
    const {
      styles
    } = this.props;
    const rootStyles = css(styles.root);

    const handleClick = () => {
      this.inputRef.focus();
    };

    return (
      <div title="New Team Member">
        <div className={rootStyles} onClick={handleClick}>
          <img alt="New Team Member" className={css(styles.avatar)} src={avatarUser} />
          <input placeholder="NewTeamMember@yourco.co" />
        </div>
      </div>
    );
  }
}

AddSoftTeamMember.propTypes = {
  avatar: PropTypes.string,
  closePortal: PropTypes.func,
  hr: PropTypes.oneOf([
    'before',
    'after'
  ]),
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  isActive: PropTypes.bool,
  label: PropTypes.any,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  title: PropTypes.string
};

const hoverFocusStyles = {
  backgroundColor: ui.menuItemBackgroundColorHover,
  color: ui.menuItemColorHoverActive,
  outline: 0
};

const activeHoverFocusStyles = {
  backgroundColor: ui.menuItemBackgroundColorActive
};


const styleThunk = () => ({
  root: {
    alignItems: 'center',
    backgroundColor: ui.menuBackgroundColor,
    color: ui.menuItemColor,
    cursor: 'pointer',
    display: 'flex',
    transition: `background-color ${ui.transition[0]}`,

    ':hover': {
      ...hoverFocusStyles
    },
    ':focus': {
      ...hoverFocusStyles
    }
  },

  active: {
    backgroundColor: ui.menuItemBackgroundColorActive,
    color: ui.menuItemColorHoverActive,
    cursor: 'default',

    ':hover': {
      ...activeHoverFocusStyles
    },
    ':focus': {
      ...activeHoverFocusStyles
    }
  },

  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal}`
  },

  labelWithIcon: {
    paddingLeft: 0
  },

  hr: {
    backgroundColor: ui.menuBorderColor,
    border: 'none',
    height: '1px',
    marginBottom: ui.menuGutterVertical,
    marginTop: ui.menuGutterVertical,
    padding: 0
  },

  avatar: {
    borderRadius: '100%',
    height: '1.5rem',
    marginLeft: ui.menuGutterHorizontal,
    marginRight: ui.menuGutterInner,
    width: '1.5rem'
  }
});

export default withStyles(styleThunk)(AddSoftTeamMember);
