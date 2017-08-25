import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';

class MeetingAvatarMenu extends Component {
  render() {
    const {avatar, closePortal, handleNavigate, handlePromote, styles} = this.props;
    const {isFacilitating, isSelf, preferredName} = avatar;
    return (
      <div>
        {handleNavigate &&
        <MenuItem
          key="handleNavigate"
          label={`Navigate to ${preferredName}`}
          onClick={handleNavigate}
          closePortal={closePortal}
        />
        }
        {handlePromote &&
        <MenuItem
          key="promoteToFacilitator"
          label={`Promote ${preferredName} to facilitator`}
          onClick={handlePromote}
          closePortal={closePortal}
          />
        }
      </div>
    );
  }
}

MeetingAvatarMenu.propTypes = {
  avatar: PropTypes.shape({
    isFacilitating: PropTypes.bool,
    isSelf: PropTypes.bool,
    preferredName: PropTypes.string
  }).isRequired,
  closePortal: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func,
  styles: PropTypes.object

};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal} 0 0`
  }
});

export default MeetingAvatarMenu;
