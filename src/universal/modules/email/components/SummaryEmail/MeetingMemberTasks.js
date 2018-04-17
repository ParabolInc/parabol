// @flow
import * as React from 'react';
import MeetingMemberTaskList from './MeetingMemberTaskList';
import MeetingMemberNoTasks from './MeetingMemberNoTasks';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';

type Props = {|
  meetingType: MeetingTypeEnum,
  meeting: Object
|};

const MeetingMemberTasks = (props: Props) => {
  const {meetingType, meeting} = props;
  const {meetingMembers} = meeting;
  const membersWithTasks = meetingMembers.filter(({tasks}) => tasks.length > 0);
  const membersWithoutTasks = meetingMembers.filter(({tasks}) => tasks.length === 0);
  // local flag, wanna try without this section without completely yanking (TA)
  const showMembersWithoutTasks = false;
  return (
    <React.Fragment>
      {membersWithTasks.map((member) =>
        <MeetingMemberTaskList member={member} key={member.id} />
      )}
      {showMembersWithoutTasks && <MeetingMemberNoTasks meetingType={meetingType} members={membersWithoutTasks} />}
    </React.Fragment>
  );
};

export default MeetingMemberTasks;
