import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import {MEETING} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import {createFragmentContainer} from 'react-relay';

class MeetingUpdates extends Component {
  render() {
    const {
      gotoNext,
      localPhaseItem,
      members,
      showMoveMeetingControls,
      styles,
      viewer
    } = this.props;
    const {team} = viewer;
    const {teamMembers} = team;
    const {projects} = teamMembers[localPhaseItem -1];
    const self = members.find((m) => m.isSelf);
    const currentTeamMember = members[localPhaseItem - 1];
    const isLastMember = localPhaseItem === members.length;
    const nextPhaseName = actionMeeting.agendaitems.name;
    return (
      <MeetingMain>
        <MeetingSection flexToFill>
          <div className={css(styles.layout)}>
            {showMoveMeetingControls ?
              <Button
                buttonStyle="flat"
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                key={`update${localPhaseItem}`}
                label={isLastMember ? `Move on to the ${nextPhaseName}` : 'Next team member '}
                onClick={gotoNext}
                buttonSize="medium"
              /> :
              <MeetingFacilitationHint>
                {isLastMember ?
                  <span>{'Waiting for '}<b>{getFacilitatorName(team, members)}</b> {`to advance to the ${nextPhaseName}`}</span> :
                  <span>{'Waiting for '}<b>{currentTeamMember.preferredName}</b> {`to give ${actionMeeting.updates.name}`}</span>
                }
              </MeetingFacilitationHint>
            }
          </div>
          <div className={css(styles.body)}>
            <ProjectColumns alignColumns="center" myTeamMemberId={self && self.id} projects={projects} area={MEETING}/>
          </div>
        </MeetingSection>
      </MeetingMain>
    );
  }
};

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  onFacilitatorPhase: PropTypes.bool,
  showMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
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

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingUpdates),
  graphql`
    fragment MeetingUpdates_viewer on User {
      team(teamId: $teamId) {
        teamMembers(sortBy: "checkInOrder") {
          projects(first: 1000) @connection(key: "MeetingUpdates_projects") {
            edges {
              node {
                id content
                createdAt
                createdBy
                integration {
                  service
                  nameWithOwner
                  issueNumber
                }
                status
                tags
                teamMemberId
                updatedAt
                sortOrder
                updatedAt
                userId
                teamId
                team {
                  id
                  name
                }
                teamMember {
                  id
                  picture
                  preferredName
                }
              }
            }
          }
        }
        activeFacilitator
      }
    }`
);
