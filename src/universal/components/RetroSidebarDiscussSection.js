// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarDiscussSection_viewer as Viewer} from './__generated__/RetroSidebarDiscussSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ui from 'universal/styles/ui';
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

const VoteTally = styled('div')({
  marginRight: '0.5rem'
});

const IndexBlock = styled('div')({
  opacity: '.5',
  paddingRight: '.75rem',
  textAlign: 'right',
  width: ui.meetingSidebarGutterInner
});

const Title = styled('span')({
  flex: 1,
  fontSize: ui.navTopicFontSize
});

const TopicRow = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontSize: ui.navTopicFontSize,
  fontWeight: 400,
  justifyContent: 'space-between',
  lineHeight: '1.5',
  minHeight: '2.5rem',
  width: '100%'
});

const CheckIcon = styled(StyledFontAwesome)({
  color: ui.palette.mid
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
            <IndexBlock>{`${idx + 1}.`}</IndexBlock>
            <Title>{title}</Title>
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
