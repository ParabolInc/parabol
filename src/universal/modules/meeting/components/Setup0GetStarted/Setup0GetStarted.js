import React, { Component, PropTypes } from 'react';
import { HotKeys } from 'react-hotkeys';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import ShortcutsMenu from '../../components/ShortcutsMenu/ShortcutsMenu';
import ShortcutsToggle from '../../components/ShortcutsToggle/ShortcutsToggle';
import { NAVIGATE_SETUP_1_INVITE_TEAM } from '../../ducks/meeting.js';
import { UPDATE_SHORTCUT_MENU_STATE } from '../../ducks/shortcuts.js';
import { updateTeamName } from '../../ducks/team.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup0GetStarted extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    shortcuts: PropTypes.object.isRequired,
    team: PropTypes.object
  }

  handleMenuToggle() {
    const { dispatch, shortcuts, team } = this.props;
    dispatch({
      type: UPDATE_SHORTCUT_MENU_STATE,
      payload: {
        boolean: !shortcuts.hasOpenShortcutMenu
      }
    });
  }

  render() {
    const { dispatch, shortcuts, team } = this.props;
    const { hasOpenShortcutMenu } = shortcuts;

    const handleNavigateToNextStep = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_1_INVITE_TEAM });
    };

    const onChangeTeamName = (event) => {
      dispatch(updateTeamName(team.instance.id, event.target.value));
    };

    const handleFieldKeyEnter = () => {
      handleNavigateToNextStep(event);
    };

    const onShortcutMenuToggle = (event) => {
      event.preventDefault();
      this.handleMenuToggle();
    };

    const keyHandlers = {
      seqHelp: onShortcutMenuToggle
    };

    let nameFieldHasValue = true;
    if (team.instance.name === '') {
      nameFieldHasValue = false;
    }

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
      <HotKeys
        focused
        attach={window}
        handlers={keyHandlers}
      >
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
          <HotKeys handlers={{ keyEnter: handleFieldKeyEnter }}>
            <SetupField
              buttonDisabled={!nameFieldHasValue}
              buttonIcon="check-circle"
              hasButton
              hasShortcutHint
              type="text"
              isLarger
              onButtonClick={handleNavigateToNextStep}
              onChange={onChangeTeamName}
              placeholder="Team name"
              shortcutHint="Press enter"
            />
          </HotKeys>
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
      </HotKeys>
    );
  }
}
