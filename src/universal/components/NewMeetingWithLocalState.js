// @flow
import React, {Component} from 'react';

import type {Match} from 'react-router-dom';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import findKeyByValue from 'universal/utils/findKeyByValue';
import {phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {withLocationMeetingState_viewer as Viewer} from '../decorators/__generated__/withLocalMeetingState_viewer.graphql';
import NewMeeting from 'universal/components/NewMeeting';
/*
 * Extracts the local phase and stage from the url and puts it into the relay store
 */

type Props = {
  atmosphere: Object,
  match: Match,
  viewer: Viewer
}

class NewMeetingWithLocalState extends Component<Props> {
  constructor(props) {
    super(props);
    this.updateLocalState(props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    const {match: {params}} = nextProps;
    const {match: {params: oldParams}} = this.props;
    if (params !== oldParams) {
      this.updateLocalState(params);
    }
  }

  updateLocalState(params) {
    const {localPhaseSlug, stageIdxSlug, teamId} = params;
    const {atmosphere, viewer: {team: {newMeeting}}} = this.props;
    if (!newMeeting) {
      // in lobby
      return;
    }

    const localPhaseType = findKeyByValue(phaseTypeToSlug, localPhaseSlug);
    const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0;
    const {phases} = newMeeting;
    const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType);
    if (!phase) return;
    const stage = phase.stages[stageIdx];
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId).getLinkedRecord('newMeeting')
        .setLinkedRecord(store.get(stage.id), 'localStage')
        .setLinkedRecord(store.get(phase.id), 'localPhase');
    });
  }

  render() {
    return <NewMeeting {...this.props} />;
  }
}

export default createFragmentContainer(
  withAtmosphere(NewMeetingWithLocalState),
  graphql`
    fragment NewMeetingWithLocalState_viewer on User {
      ...NewMeeting_viewer
      team(teamId: $teamId) {
        newMeeting {
          phases {
            id
            phaseType
            stages {
              id
              isComplete
            }
            ... on CheckInPhase {
              checkInGreeting {
                content
                language
              }
              checkInQuestion
            }
          }
        }
      }
    }
  `
);
