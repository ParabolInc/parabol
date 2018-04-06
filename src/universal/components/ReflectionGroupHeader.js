import React from 'react';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor';
import type {ReflectionGroupHeader_meeting as Meeting} from './__generated__/ReflectionGroupHeader_meeting.graphql';
import type {ReflectionGroupHeader_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupHeader_reflectionGroup.graphql';

type Props = {
  meeting: Meeting,
  reflectionGroup: ReflectionGroup
};

const ReflectionCount = styled('span')({});

const GroupHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 8
});

const ReflectionGroupHeader = (props: Props) => {
  const {meeting, reflectionGroup} = props;
  const {reflections} = reflectionGroup;
  return (
    <GroupHeader>
      <ReflectionGroupTitleEditor reflectionGroup={reflectionGroup} meeting={meeting} />
      <ReflectionCount>{reflections.length}</ReflectionCount>
    </GroupHeader>
  );
};

export default createFragmentContainer(
  ReflectionGroupHeader,
  graphql`
    fragment ReflectionGroupHeader_meeting on RetrospectiveMeeting {
      ...ReflectionGroupTitleEditor_meeting
    }
    fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupTitleEditor_reflectionGroup
      reflections {
        id
      }
    }
  `
);
