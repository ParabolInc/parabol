import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import {MEETING} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import MeetingUpdatesEmptyModal from 'universal/modules/meeting/components/MeetingUpdatesEmptyModal/MeetingUpdatesEmptyModal';

const MeetingUpdates = (props) => {
  const {
    gotoNext,
    showEmpty,
    localPhaseItem,
    members,
    queryKey,
    projects,
    showMoveMeetingControls,
    styles,
    team
  } = props;
  const self = members.find((m) => m.isSelf);
  const currentTeamMember = members[localPhaseItem - 1];
  const isLastMember = localPhaseItem === members.length;
  const advanceButton = () => (
    <Button
      buttonStyle="flat"
      colorPalette="cool"
      icon="arrow-circle-right"
      iconPlacement="right"
      key={`update${localPhaseItem}`}
      label={isLastMember ? 'Move on to the Agenda' : 'Next team member '}
      onClick={gotoNext}
      size="small"
    />
  );
  return (
    <MeetingMain>
      <MeetingSection flexToFill>
        <div className={css(styles.layout)}>
          {showMoveMeetingControls ?
            advanceButton() :
            <MeetingFacilitationHint>
              {isLastMember ?
                <span>{'Waiting for '}<b>{getFacilitatorName(team, members)}</b> {'to advance to the Agenda'}</span> :
                <span>{'Waiting for '}<b>{currentTeamMember.preferredName}</b> {'to give Updates'}</span>
              }
            </MeetingFacilitationHint>
          }
        </div>
        <div className={css(styles.body)}>
          <MeetingUpdatesEmptyModal
            advanceButton={showMoveMeetingControls && advanceButton}
            currentTeamMemberName={currentTeamMember.preferredName}
            isOpen={showEmpty}
          />
          <ProjectColumns
            alignColumns="center"
            area={MEETING}
            myTeamMemberId={self && self.id}
            projects={projects}
            queryKey={queryKey}
          />
        </div>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  showEmpty: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  onFacilitatorPhase: PropTypes.bool,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string.isRequired,
  showMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    textAlign: 'center',
    width: '100%'
  },

  body: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: '1rem 1rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingUpdates);
