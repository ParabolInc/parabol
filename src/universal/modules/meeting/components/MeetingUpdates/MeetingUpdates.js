import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {MEETING} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const MeetingUpdates = (props) => {
  const {
    gotoNext,
    localPhaseItem,
    members,
    queryKey,
    projects,
    styles,
    hideMoveMeetingControls
  } = props;
  const self = members.find((m) => m.isSelf);
  const isLastMember = localPhaseItem === members.length;
  return (
    <MeetingMain>
      <MeetingSection flexToFill>
        <div className={css(styles.layout)}>
          {!hideMoveMeetingControls &&
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
          }
        </div>
        <div className={css(styles.body)}>
          <ProjectColumns alignColumns="center" myTeamMemberId={self && self.id} projects={projects} queryKey={queryKey} area={MEETING} />
        </div>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  onFacilitatorPhase: PropTypes.bool,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  hideMoveMeetingControls: PropTypes.bool
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
    padding: '1rem 1rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingUpdates);
