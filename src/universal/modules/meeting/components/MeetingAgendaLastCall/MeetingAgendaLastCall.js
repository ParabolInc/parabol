import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';
import plural from 'universal/utils/plural';

const MeetingAgendaLastCall = (props) => {
  const {
    team: {agendaItems},
    hideMoveMeetingControls,
    gotoNext,
    facilitatorName,
    styles
  } = props;
  const agendaItemCount = agendaItems.filter((item) => item.isComplete).length;
  const labelAgendaItems = plural(0, AGENDA_ITEM_LABEL);

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>
            {agendaItemCount === 0 ?
              <span>{`No ${labelAgendaItems}?`}</span> :
              <span>{`That wraps up the ${actionMeeting.agendaitems.name}!`}</span>
            }
          </MeetingPhaseHeading>
          {agendaItemCount === 0 ?
            <Type
              align="center"
              marginBottom="2.5rem"
              marginTop=".5rem"
              scale="s5"
              colorPalette="black"
            >
              <span>
                {`Looks like you didn’t process any ${labelAgendaItems}.`}
                <br />
                {`You can add ${labelAgendaItems} in the left sidebar before ending the meeting.`}
                <br />
                {'Simply tap on any items you create to process them.'}
              </span>
            </Type> :
            <Type
              align="center"
              bold
              marginBottom="2.5rem"
              marginTop=".5rem"
              scale="s5"
              colorPalette="black"
            >
              {'We worked on '}
              <span className={css(styles.highlight)}>
                {`${agendaItemCount} ${plural(agendaItemCount, AGENDA_ITEM_LABEL)}`}
              </span>
              {'—need anything else?'}
            </Type>
          }

          <AgendaShortcutHint />

          <div className={css(styles.controlBlock)}>
            {!hideMoveMeetingControls ?
              <Button
                buttonStyle="solid"
                colorPalette="cool"
                depth={1}
                isBlock
                label="End Meeting"
                onClick={gotoNext}
                buttonSize="large"
                textTransform="uppercase"
              /> :
              <MeetingFacilitationHint>
                {'Waiting for'} <b>{facilitatorName}</b> {'to end the meeting'}
              </MeetingFacilitationHint>
            }
          </div>
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaLastCall.propTypes = {
  team: PropTypes.object.isRequired,
  gotoNext: PropTypes.func,
  facilitatorName: PropTypes.string,
  hideMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  highlight: {
    color: appTheme.palette.warm
  },

  controlBlock: {
    margin: '0 auto',
    paddingTop: '2.25rem',
    width: '12rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2.5rem',
    padding: '.25rem 1rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingAgendaLastCall),
  graphql`
    fragment MeetingAgendaLastCall_team on Team {
      agendaItems {
        ...MeetingAgendaLastCall_agendaItem
      }
    }
    fragment MeetingAgendaLastCall_agendaItem on AgendaItem {
      isComplete
    }
  `
);
