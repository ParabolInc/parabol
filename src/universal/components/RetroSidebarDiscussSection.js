// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarDiscussSection_viewer as Viewer} from './__generated__/RetroSidebarDiscussSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';

type Props = {|
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
|}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '1rem'
});

const Header = styled('div')({
  fontWeight: 'bold'
});

const RetroSidebarDiscussSection = (props: Props) => {
  const {gotoStageId, viewer: {team: {newMeeting}}} = props;
  const {localPhase} = newMeeting || {};
  if (!localPhase || !localPhase.stages) return null;
  const {stages} = localPhase;
  return (
    <SidebarPhaseItemChild>
      <Header>{'Upvoted Topics'}</Header>
      {stages.map((stage, idx) => {
        const {reflectionGroup} = stage;
        const title = reflectionGroup && reflectionGroup.title || 'Unknown group';
        return (
          <div key={stage.id} onClick={() => gotoStageId(stage.id)}>
            <span>{`${idx + 1}. `}</span>
            <span>{title}</span>
          </div>
        );
      })}
    </SidebarPhaseItemChild>
  );
};

export default createFragmentContainer(
  RetroSidebarDiscussSection,
  graphql`
    fragment RetroSidebarDiscussSection_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          ... on RetrospectiveMeeting {
            # load up the localPhase
            phases {
              ... on DiscussPhase {
                stages {
                  id
                  reflectionGroup {
                    title
                  }
                }
              }
            }
            localPhase {
              ... on DiscussPhase {
                stages {
                  id
                  reflectionGroup {
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  `
);
