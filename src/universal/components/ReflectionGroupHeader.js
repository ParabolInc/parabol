import React from 'react';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor';
import type {ReflectionGroupHeader_meeting as Meeting} from './__generated__/ReflectionGroupHeader_meeting.graphql';
import type {ReflectionGroupHeader_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupHeader_reflectionGroup.graphql';
import {GROUP, VOTE} from 'universal/utils/constants';
import ReflectionGroupVoting from 'universal/components/ReflectionGroupVoting';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

type Props = {
  meeting: Meeting,
  reflectionGroup: ReflectionGroup
};

const GroupHeader = styled('div')(({phaseType}) => ({
  display: 'flex',
  fontSize: '.875rem',
  justifyContent: phaseType === VOTE ? 'space-between' : 'center',
  marginBottom: 8,
  width: '100%'
}));

const TitleAndCount = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 1,
  justifyContent: 'center',
  position: 'relative',
  width: 'auto'
});

const ReflectionCount = styled('span')({
  color: ui.hintFontColor,
  fontSize: ui.cardThemeLabelFontSize,
  left: '100%',
  lineHeight: ui.cardThemeLabelLineHeight,
  position: 'absolute'
});

const PencilIcon = styled(FontAwesome)({
  color: ui.hintFontColor,
  height: ui.iconSize,
  left: '100%',
  lineHeight: ui.cardThemeLabelLineHeight,
  opacity: '.5',
  position: 'absolute',
  textAlign: 'center',
  top: '-.0625rem',
  width: ui.iconSize,
});

const Spacer = styled('div')({width: ui.votingCheckmarksWidth});

const ReflectionGroupHeader = (props: Props) => {
  const {meeting, reflectionGroup} = props;
  const {reflections} = reflectionGroup;
  const {localStage, localPhase: {phaseType}} = meeting;
  console.log('meeting');
  console.dir(meeting);
  const groupPhaseNotComplete = phaseType === GROUP && localStage.isComplete === false;
  const showCount = false; // local flag, testing new UI (TA)
  // <ReflectionGroupTitleEditor reflectionGroup={reflectionGroup} meeting={meeting} readOnly={phaseType !== GROUP} />
  return (
    <GroupHeader phaseType={phaseType}>
      {phaseType === VOTE && <Spacer />}
      <TitleAndCount>
        <ReflectionGroupTitleEditor reflectionGroup={reflectionGroup} meeting={meeting} readOnly={!groupPhaseNotComplete} />
        {showCount && <ReflectionCount>{reflections.length}</ReflectionCount>}
        {groupPhaseNotComplete === GROUP && <PencilIcon name="pencil" />}
      </TitleAndCount>
      {phaseType === VOTE && <ReflectionGroupVoting reflectionGroup={reflectionGroup} meeting={meeting} />}
    </GroupHeader>
  );
};

export default createFragmentContainer(
  ReflectionGroupHeader,
  graphql`
    fragment ReflectionGroupHeader_meeting on RetrospectiveMeeting {
      localStage {
        isComplete
      }
      localPhase {
        phaseType
      }
      ...ReflectionGroupTitleEditor_meeting
      ...ReflectionGroupVoting_meeting
    }
    fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupTitleEditor_reflectionGroup
      ...ReflectionGroupVoting_reflectionGroup
      reflections {
        id
      }
    }
  `
);
