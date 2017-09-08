import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import {MEETING} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import checkForProjects from 'universal/utils/checkForProjects';

const MeetingUpdates = (props) => {
  const {
    gotoNext,
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
  const hasProjects = checkForProjects(projects);
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
          {!hasProjects &&
            <div className={css(styles.noProjectsMessage)}>
              <div className={css(styles.noProjectsHeading)}>
                {'No projects; any updates?'}
              </div>
              <p>{'We’re not currently tracking any projects for'} <b>{currentTeamMember.preferredName}</b>.</p>
              <p>{'You can add projects during the Agenda.'}</p>
              <p>{'Just press “'}<b>{'+'}</b>{'” to add an Agenda Item.'}</p>
              {showMoveMeetingControls &&
                <div className={css(styles.noProjectsButtonBlock)}>
                  {advanceButton()}
                </div>
              }
            </div>
          }
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
    position: 'relative',
    width: '100%'
  },

  noProjectsMessage: {
    backgroundColor: appTheme.palette.light50l,
    borderRadius: ui.modalBorderRadius,
    boxShadow: ui.modalBoxShadow,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    left: '50%',
    lineHeight: '1.5',
    maxWidth: '36rem',
    padding: '1.5rem',
    position: 'absolute',
    textAlign: 'center',
    top: '6rem',
    transform: 'translate3d(-50%, 0, 0)',
    width: '100%',
    zIndex: 200
  },

  noProjectsHeading: {
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    lineHeight: '2',
    margin: '0 0 1rem'
  },

  noProjectsButtonBlock: {
    marginTop: '1rem'
  }
});

export default withStyles(styleThunk)(MeetingUpdates);
