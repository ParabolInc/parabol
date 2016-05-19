import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import Avatar from '../../components/Avatar/Avatar';
import AvatarGroup from '../../components/AvatarGroup/AvatarGroup';
import Background from '../../components/Background/Background';
import Button from '../../components/Button/Button';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import ShortcutsMenu from '../../components/ShortcutsMenu/ShortcutsMenu';
import ShortcutsToggle from '../../components/ShortcutsToggle/ShortcutsToggle';

import avatarTerryAcker from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';
import avatarJordanHusney from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import avatarTayaMueller from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

import {
  NAVIGATE_SETUP_1_INVITE_TEAM,
  updateMeetingTeamName,
  UPDATE_SHORTCUT_MENU_STATE
} from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup0GetStarted extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    uiState: PropTypes.object
  }
  render() {
    const { dispatch, uiState } = this.props;
    const { hasOpenShortcutMenu } = uiState;

    const onClick = (event) => {
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

    const avatarsDemo = [
      {
        badge: 'absent',
        image: avatarTerryAcker,
        name: 'Terry Acker'
      },
      {
        badge: 'present',
        image: avatarJordanHusney,
        name: 'Jordan Husney'
      },
      {
        badge: 'active',
        image: avatarTayaMueller,
        name: 'Taya Mueller'
      }
    ];

    return (
      <SetupContent>
        {/* Testing Button component */}
        <Button label="Sign Up" />

        <br />
        <br />

        <Button
          label="Start Meeting"
          size="largest"
          style="outlined"
          theme="warm"
          title="Let’s get started!"
        />

        <br />
        <br />

        <Button
          label="End Meeting"
          size="smallest"
          style="outlined"
          theme="cool"
        />

        <br />
        <br />
        <Background align="center" theme="dark">
          <Button
            label="Create Project"
            size="large"
            style="solid"
            theme="light"
          />
        </Background>

        <Background align="center" theme="cool">
          <Button
            label="Create Project"
            size="large"
            style="inverted"
            theme="cool"
          />
        </Background>

        <Background align="center" theme="warm" width="full">
          <Button
            label="Start Now"
            size="small"
            style="outlined"
            theme="white"
          />
        </Background>

        <br />
        <br />

        {/* Testing AvatarGroup component */}
        <AvatarGroup avatars={avatarsDemo} label="Avatar group:" />

        {/* Testing the Avatar component */}
        {/* The 'large' variant is seen during project updates and requests. */}
        <Avatar
          hasLabel
          image={avatarTerryAcker}
          name="Terry Acker"
          size="large"
        />
        <br />
        <br />
        {/* The 'medium' variant is intended for card components. */}
        <Avatar
          badge="present"
          hasLabel
          image={avatarJordanHusney}
          name="Jordan Husney"
          size="medium"
        />
        <br />
        <br />
        {/* The 'small' variant is also the default. */}
        <Avatar
          badge="active"
          hasLabel
          image={avatarTayaMueller}
          name="Taya Mueller"
          size="small"
        />
        <br />
        <br />
        {/*
          The 'smallest' variant represents the assignment action
          in the project creation field during requests.
        */}
        <Avatar
          hasLabel
          image={avatarJordanHusney}
          labelRight
          name="Jordan Husney"
          size="smallest"
        />
        <br />
        <br />
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
          type="text"
          isLarger
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onChange={onChangeTeamName}
          onFocus={() => console.log('SetupField.onFocus')}
          placeholder="Team name"
          shortcutHint="Press enter"
        />
        <AdvanceLink
          onClick={onClick}
          icon="arrow-circle-right"
          label="Set-up"
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
