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

  const hintName = hideMoveMeetingControls ? facilitatorName : 'you';

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>
            {agendaItemCount === 0 ?
              <span>{`No ${labelAgendaItems}?`}</span> :
              <span>{'Last Call:'}</span>
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
              {'We’ve worked on '}
              <span className={css(styles.highlight)}>
                {`${agendaItemCount} ${plural(agendaItemCount, AGENDA_ITEM_LABEL)}`}
              </span>
              {' so far—need anything else?'}
            </Type>
          }

          <AgendaShortcutHint />

          <div className={css(styles.controlBlock)}>
            {!hideMoveMeetingControls &&
              <Button
                aria-label="End Meeting"
                buttonSize="large"
                buttonStyle="solid"
                colorPalette="cool"
                depth={1}
                isBlock
                label="End Meeting"
                onClick={gotoNext}
                textTransform="uppercase"
              />
            }
          </div>
          <div className={css(styles.hintBlock)}>
            <MeetingFacilitationHint>
              {'Waiting for'} <b>{hintName}</b> {'to move on'}
            </MeetingFacilitationHint>
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
    padding: '2.25rem 0 1rem',
    width: '12rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2.5rem',
    padding: '.25rem 1rem'
  },

  hintBlock: {
    textAlign: 'center',
    width: '100%'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingAgendaLastCall),
  graphql`
    fragment MeetingAgendaLastCall_team on Team {
      agendaItems {
        isComplete
      }
    }`
);
