// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarDiscussSection_viewer as Viewer} from './__generated__/RetroSidebarDiscussSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import appTheme from 'universal/styles/theme/appTheme';
import textOverflow from 'universal/styles/helpers/textOverflow';
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock';
import {LabelHeading} from 'universal/components';

type Props = {|
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
|}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column'
});

const Header = styled('div')({
  fontWeight: 600
});

const VoteTally = styled('span')({
  marginRight: '0.5rem'
});

const ItemNumberAndTitle = styled('span')({
  ...textOverflow,
  width: '60%'
});

const Title = styled('span')({

});

const TopicRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
});

const CheckIcon = styled(StyledFontAwesome)({
  color: appTheme.palette.warm
});

const RetroSidebarDiscussSection = (props: Props) => {
  const {gotoStageId, viewer: {team: {newMeeting}}} = props;
  const {localPhase} = newMeeting || {};
  if (!localPhase || !localPhase.stages) return null;
  const {stages} = localPhase;
  return (
    <SidebarPhaseItemChild>
      <MeetingSidebarLabelBlock>
        <LabelHeading>{'Upvoted Topics'}</LabelHeading>
      </MeetingSidebarLabelBlock>
      {stages.map((stage, idx) => {
        const {reflectionGroup} = stage;
        if (!reflectionGroup) return null;
        const {title, voteCount} = reflectionGroup;
        return (
          <TopicRow key={stage.id} onClick={() => gotoStageId(stage.id)}>
            <ItemNumberAndTitle>
              <span>{`${idx + 1}. `}</span>
              <Title>{title}</Title>
            </ItemNumberAndTitle>
            <VoteTally>
              <CheckIcon name="check" />
              {' x '}
              {voteCount}
            </VoteTally>
          </TopicRow>
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
                    voteCount
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
                    voteCount
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
