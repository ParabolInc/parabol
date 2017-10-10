import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingAgendaCardsContainer from 'universal/modules/meeting/containers/MeetingAgendaCards/MeetingAgendaCardsContainer';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const MeetingAgendaItems = (props) => {
  const {
    agendaItem,
    gotoNext,
    hideMoveMeetingControls,
    isLast,
    localPhaseItem,
    members,
    styles,
    team
  } = props;

  if (!agendaItem) {
    return <LoadingView />;
  }
  const currentTeamMember = members.find((m) => m.id === agendaItem.teamMemberId);
  const self = members.find((m) => m.isSelf);
  if (!currentTeamMember || !self) {
    return <LoadingView />;
  }
  const heading = <span>{currentTeamMember.preferredName}: <i style={{color: ui.palette.warm}}>“{agendaItem.content}”</i></span>;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection flexToFill>
          <div className={css(styles.layout)}>
            <div className={css(styles.prompt)}>
              <MeetingPrompt
                avatar={currentTeamMember.picture}
                heading={heading}
                subHeading={'What do you need?'}
              />
            </div>
            <div className={css(styles.nav)}>
              {hideMoveMeetingControls ?
                <MeetingFacilitationHint>
                  {'Waiting for'} <b>{getFacilitatorName(team, members)}</b> {`to wrap up the ${actionMeeting.agendaitems.name}`}
                </MeetingFacilitationHint> :
                <Button
                  buttonStyle="flat"
                  colorPalette="cool"
                  icon="arrow-circle-right"
                  iconPlacement="right"
                  key={`agendaItem${localPhaseItem}`}
                  label={isLast ? 'Wrap up the meeting' : `Next ${AGENDA_ITEM_LABEL}`}
                  onClick={gotoNext}
                  buttonSize="medium"
                />
              }
            </div>
            <MeetingAgendaCardsContainer
              agendaId={agendaItem.id}
              myTeamMemberId={self.id}
            />
          </div>
        </MeetingSection>
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingAgendaItems.propTypes = {
  agendaItem: PropTypes.object.isRequired,
  gotoNext: PropTypes.func.isRequired,
  hideMoveMeetingControls: PropTypes.bool,
  isLast: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  styles: PropTypes.object.isRequired,
  team: PropTypes.object
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 .5rem 4rem',
    width: '100%',

    [ui.breakpoint.wide]: {
      paddingBottom: '0 1rem 6rem'
    },

    [ui.breakpoint.wider]: {
      paddingBottom: '8rem'
    },

    [ui.breakpoint.widest]: {
      paddingBottom: '12rem'
    }
  },

  prompt: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },

  nav: {
    paddingTop: '1rem',
    textAlign: 'center',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingAgendaItems);
