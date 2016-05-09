import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import ShortcutsMenu from '../../components/ShortcutsMenu/ShortcutsMenu';
import ShortcutsToggle from '../../components/ShortcutsToggle/ShortcutsToggle';
import { NAVIGATE_SETUP_1_INVITE_TEAM, updateMeetingTeamName } from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup0GetStarted extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  }
  render() {
    const { dispatch } = this.props;

    const onClick = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_1_INVITE_TEAM });
    };

    const onChangeTeamName = (event) => {
      dispatch(updateMeetingTeamName(event.target.value, 'anonymous'));
    };

    let menuOpen = true;

    const onCloseShortcutMenuClose = (event) => {
      event.preventDefault();
      menuOpen = true;
    };

    const onShortcutsToggleClick = (event) => {
      event.preventDefault();
      menuOpen = false;
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
          numCompleted={0}
          currentDot={0}
        />
        <SetupHeader
          heading="Let’s get started!"
          subHeading={<span>What do you call your team?</span>}
        />
        <SetupField
          buttonIcon="check-circle"
          hasButton
          hasShortcutHint
          inputType="text"
          isLarger
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onInputChange={onChangeTeamName}
          onInputFocus={() => console.log('SetupField.onInputFocus')}
          placeholderText="Team name"
          shortcutHint="Press enter"
        />
        <AdvanceLink
          onClick={onClick}
          icon="arrow-circle-right"
          label="Set-up"
        />
        {menuOpen &&
          <ShortcutsMenu
            shortcutsList={shortcutsRequests}
            onCloseClick={onCloseShortcutMenuClose}
          />
        }
        {!menuOpen &&
          <ShortcutsToggle onClick={onShortcutsToggleClick} />
        }
      </SetupContent>
    );
  }
}
