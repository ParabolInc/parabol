// import {GraphQLInterfaceType} from 'graphql';
// import {notificationInterfaceFields} from 'server/graphql/types/Notification';
// import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
// import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
// import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
//
// import {KICKED_OUT, TEAM_ARCHIVED} from 'universal/utils/constants';
//
// const TeamAddedNotification = new GraphQLInterfaceType({
//  name: 'TeamAddedNotification',
//  fields: () => notificationInterfaceFields,
//  resolveType(value) {
//    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
//    // alternative to treating it like a DB driver if GCing is an issue
//    const resolveTypeLookup = {
//      [ADD_TO_TEAM]: NotifyAddedToTeam,
//      [TEAM_ARCHIVED]: NotifyTeamArchived
//    };
//
//    return resolveTypeLookup[value.type];
//  }
// });
//
// export default TeamAddedNotification;
