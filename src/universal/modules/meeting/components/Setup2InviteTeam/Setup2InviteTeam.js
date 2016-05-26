import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupFieldGroup from '../../components/SetupFieldGroup/SetupFieldGroup';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import * as _ from 'lodash';
import { NAVIGATE_SETUP_1_INVITE_TEAM, } from '../../ducks/meeting.js';
import {
  createInvites,
  removeInvitee,
  SETUP2_UPDATE_ROW_HOVER
} from '../../ducks/setup.js';

const onSetupFieldGroupInputChange = () => {
  console.log('onSetupFieldGroupInputChange()');
};

const fieldInputDefault = {
  onChange: onSetupFieldGroupInputChange,
  placeholder: 'What\'s their priority for today?',
  type: 'text'
};

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup2InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    setup: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired
  };

  render() {
    const {dispatch, setup, team} = this.props;

    const emptyList = setup.setup1.emails.length === 0;

    // TODO: Set 'projectFieldsCompleted' to true when all project fields are completed
    const projectFieldsCompleted = true;

    const handleNavigateToPreviousStep = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_1_INVITE_TEAM });
    };

    const onInviteeRemove = (label) => {
      dispatch(removeInvitee(label));
    };

    const onInviteeRowMouseEnter = (index) => {
      dispatch({
        type: SETUP2_UPDATE_ROW_HOVER,
        payload: index
      });
    };

    const onInviteeRowMouseLeave = () => {
      dispatch({
        type: SETUP2_UPDATE_ROW_HOVER,
        payload: ''
      });
    };

    const fieldGroup = _.map(setup.setup1.emails, (emailItem) => {
      const label = emailItem.name || emailItem.address;
      return ({
        row: {
          onMouseEnter: onInviteeRowMouseEnter,
          onMouseLeave: onInviteeRowMouseLeave,
          rowWithHover: setup.setup2.rowWithHover
        },
        button: {
          onClick: () => onInviteeRemove(label),
          title: 'Remove this email invitation'
        },
        input: {
          ...fieldInputDefault,
          value: ''
        },
        label
      });
    });

    const handleContinue = (disabled) => {
      if (disabled) {
        console.log('handleContinue: disabled');
      } else {
        dispatch(createInvites(team.instance.id));
        console.log('handleContinue: NOT disabled');
      }
    };

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={3}
          currentDot={3}
        />
        <SetupHeader
          heading="What are you working on?"
          subHeading={<span>What’s <i>one outcome</i> each person is working on this week?</span>}
        />
        {emptyList &&
          <SetupContent>
            {/* eslint-disable max-len */}
            <div>You zapped the last email address! <a href="#" onClick={handleNavigateToPreviousStep} title="Add more email addresses">Add more email addresses</a></div>
          </SetupContent>
        }
        {!emptyList &&
          <SetupContent>
            <SetupFieldGroup contentLabel="Invited" fields={fieldGroup} fieldLabel="Outcome" />
            <AdvanceLink
              disabled={!projectFieldsCompleted}
              onClick={handleContinue}
              icon="arrow-circle-right"
              label="Continue"
            />
          </SetupContent>
        }
      </SetupContent>
    );
  }
}
