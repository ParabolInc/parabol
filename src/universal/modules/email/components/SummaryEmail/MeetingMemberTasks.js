// @flow
import * as React from 'react';
import MeetingMemberTaskList from './MeetingMemberTaskList';
import MeetingMemberNoTasks from './MeetingMemberNoTasks';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
// boop
type Props = {|
  meetingType: MeetingTypeEnum,
  meeting: Object
|};

const MeetingMemberTasks = (props: Props) => {
  const {meetingType, meeting} = props;
  const {meetingMembers} = meeting;
  const membersWithTasks = meetingMembers.filter(({tasks}) => tasks.length > 0);
  const membersWithoutTasks = meetingMembers.filter(({tasks}) => tasks.length === 0);
  return (
    <React.Fragment>
      {membersWithTasks.map((member) =>
        <MeetingMemberTaskList member={member} key={member.id} />
      )}
      <MeetingMemberNoTasks meetingType={meetingType} members={membersWithoutTasks} />
    </React.Fragment>
  );
};

export default MeetingMemberTasks;
