import {GraphQLInterfaceType} from 'graphql';
import {notificationInterfaceFields} from 'server/graphql/types/Notification';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';

import {KICKED_OUT, TEAM_ARCHIVED} from 'universal/utils/constants';

const TeamRemovedNotification = new GraphQLInterfaceType({
  name: 'TeamRemovedNotification',
  fields: () => notificationInterfaceFields,
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [KICKED_OUT]: NotifyKickedOut,
      [TEAM_ARCHIVED]: NotifyTeamArchived
    };

    return resolveTypeLookup[value.type];
  }
});

export default TeamRemovedNotification;
