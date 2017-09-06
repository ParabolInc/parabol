import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import {MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const MeetingAvatarMenu = (props) => {
  const {avatar, closePortal, handleNavigate, handlePromote, handleRequest, localPhase, styles} = props;
  const {isCheckedIn, isConnected, preferredName} = avatar;
  const connected = isConnected ? 'connected' : 'disconnected';
  const checkedIn = isCheckedIn ? ' and checked in' : '';
  const headerLabel = `${preferredName} is ${connected} ${checkedIn}`;
  const phaseInfo = actionMeeting[localPhase];
  const {name: phaseName} = phaseInfo;
  return (
    <div>
      <div className={css(styles.label)}>{headerLabel}</div>
      {handleNavigate &&
      <MenuItem
        key="handleNavigate"
        label={`See ${preferredName}'s ${phaseName}`}
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
      {handleRequest &&
      <MenuItem
        key="requestFacilitator"
        label={'Request to become facilitator'}
        onClick={handleRequest}
        closePortal={closePortal}
      />
      }
    </div>
  );
};

MeetingAvatarMenu.propTypes = {
  avatar: PropTypes.shape({
    isCheckedIn: PropTypes.bool,
    isConnected: PropTypes.bool,
    preferredName: PropTypes.string
  }).isRequired,
  closePortal: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func,
  handlePromote: PropTypes.func,
  handleRequest: PropTypes.func,
  localPhase: PropTypes.string.isRequired,
  styles: PropTypes.object

};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    borderBottom: `1px solid ${appTheme.palette.mid30l}`,
    color: ui.palette.dark,
    fontSize: ui.menuItemFontSize,
    fontWeight: 700,
    lineHeight: ui.menuItemHeight,
    marginBottom: ui.menuGutterVertical,
    padding: `0 ${ui.menuGutterHorizontal}`
  }
});

export default withStyles(styleThunk)(MeetingAvatarMenu);
