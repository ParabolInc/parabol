import {MEETING} from 'universal/utils/constants';

const getUsersToIgnore = (area, teamMembers) => {
  return area === MEETING ? teamMembers.filter((m) => m.isCheckedIn).map(({userId}) => userId) : [];
};

export default getUsersToIgnore;
