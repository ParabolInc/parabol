import React from 'react';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor';
import type {ReflectionGroupHeader_meeting as Meeting} from './__generated__/ReflectionGroupHeader_meeting.graphql';
import type {ReflectionGroupHeader_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupHeader_reflectionGroup.graphql';
import {GROUP, VOTE} from 'universal/utils/constants';
import ReflectionGroupVoting from 'universal/components/ReflectionGroupVoting';

type Props = {
  meeting: Meeting,
  reflectionGroup: ReflectionGroup
};

const ReflectionCount = styled('span')({});

const GroupHeader = styled('div')({
  display: 'flex',
  marginBottom: 8
});

const TitleAndCount = styled('div')({
  display: 'flex',
  alignItems: 'center'
});

const ReflectionGroupHeader = (props: Props) => {
  const {meeting, reflectionGroup} = props;
  const {reflections} = reflectionGroup;
  const {localPhase: {phaseType}} = meeting;
  return (
    <GroupHeader>
      <TitleAndCount>
        <ReflectionGroupTitleEditor reflectionGroup={reflectionGroup} meeting={meeting} readOnly={phaseType !== GROUP} />
        <ReflectionCount>{reflections.length}</ReflectionCount>
      </TitleAndCount>
      {phaseType === VOTE && <ReflectionGroupVoting reflectionGroup={reflectionGroup} meeting={meeting} />}
    </GroupHeader>
  );
};

export default createFragmentContainer(
  ReflectionGroupHeader,
  graphql`
    fragment ReflectionGroupHeader_meeting on RetrospectiveMeeting {
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
