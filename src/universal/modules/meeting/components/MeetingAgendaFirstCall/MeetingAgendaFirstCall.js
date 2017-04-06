import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme';
import {css} from 'aphrodite-local-styles/no-important';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';

const MeetingAgendaFirstCall = (props) => {
  const {
    gotoNext,
    team,
    members,
    hideMoveMeetingControls,
    styles
  } = props;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>
            {'Now…what do you need?'}
          </MeetingPhaseHeading>
          <Type align="center" bold marginBottom="2rem" scale="s5" colorPalette="black">
            (Time to add your agenda items to the list.)
          </Type>

          <AgendaShortcutHint />

          {!hideMoveMeetingControls ?
            <div className={css(styles.buttonBlock)}>
              <Button
                buttonStyle="flat"
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                label="Let’s begin: Agenda"
                onClick={gotoNext}
                size="largest"
              />
            </div> :
            <div className={css(styles.warmHighlight)}>
              <Type align="center" scale="s4" colorPalette="black">
                <span className={css(styles.highlight)}>
                  Waiting for <b>{getFacilitatorName(team, members)}</b> to advance the meeting<Ellipsis />
                </span>
              </Type>
            </div>
          }
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaFirstCall.propTypes = {
  gotoNext: PropTypes.func,
  hideMoveMeetingControls: PropTypes.bool,
  members: PropTypes.array,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  highlight: {
    color: appTheme.palette.warm
  },

  buttonBlock: {
    marginTop: '2rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2rem',
    padding: '.25rem 1rem'
  }
});

export default withStyles(styleThunk)(MeetingAgendaFirstCall);
