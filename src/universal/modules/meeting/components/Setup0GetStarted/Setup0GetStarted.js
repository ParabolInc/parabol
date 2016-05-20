import React, { Component, PropTypes } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import ShortcutsMenu from '../../components/ShortcutsMenu/ShortcutsMenu';
import ShortcutsToggle from '../../components/ShortcutsToggle/ShortcutsToggle';

import {
  NAVIGATE_SETUP_1_INVITE_TEAM,
  updateMeetingTeamName,
  UPDATE_SHORTCUT_MENU_STATE
} from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup0GetStarted extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    uiState: PropTypes.object,
    team: PropTypes.object
  }
  render() {
    const { dispatch, uiState, team } = this.props;
    const { hasOpenShortcutMenu } = uiState;

    const handleNavigateToNextStep = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_1_INVITE_TEAM });
    };

    const onChangeTeamName = (event) => {
      dispatch(updateMeetingTeamName(event.target.value, 'anonymous'));
    };

    // TODO: Add shortcut key “?” to open/close ShortcutsMenu
    const onShortcutMenuToggle = (event) => {
      event.preventDefault();
      dispatch({
        type: UPDATE_SHORTCUT_MENU_STATE,
        payload: {
          boolean: !hasOpenShortcutMenu
        }
      });
    };

    const shortcutsRequests = [
      {
        keystroke: 'a',
        definition: <span>Add an <b>Action</b> for this request</span>
      },
      {
        keystroke: 'p',
        definition: <span>Add a <b>Project</b> for this request</span>
      },
      {
        keystroke: '@',
        definition: <span><b>Assign</b> to a team member</span>
      },
      {
        keystroke: 'r',
        definition: <span>Mark this request as <b>resolved</b></span>
      }
    ];

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={1}
          currentDot={1}
        />
        <SetupHeader
          heading="Let’s get started!"
          subHeading={<span>What do you call your team?</span>}
        />
        <SetupField
          buttonDisabled={!team.nameFieldHasValue}
          buttonIcon="check-circle"
          hasButton
          hasShortcutHint
          type="text"
          isLarger
          onButtonClick={handleNavigateToNextStep}
          onChange={onChangeTeamName}
          onFocus={() => console.log('SetupField.onFocus')}
          placeholder="Team name"
          shortcutHint="Press enter"
        />
        {hasOpenShortcutMenu &&
          <ShortcutsMenu
            shortcutsList={shortcutsRequests}
            onCloseClick={onShortcutMenuToggle}
          />
        }
        {!hasOpenShortcutMenu &&
          <ShortcutsToggle onClick={onShortcutMenuToggle} />
        }
      </SetupContent>
    );
  }
}
