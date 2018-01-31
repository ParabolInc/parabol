// import {UPDATE} from 'universal/utils/constants';
// import {ConnectionHandler} from 'relay-runtime';
//
// const FilteredProjectsHandler = {
//   update(store, payload) {
//     ConnectionHandler.update(store, payload);
//     console.log('payload', payload);
//     const record = store.get(payload.dataID);
//     if (!record) return;
//
//     const connection = record.getLinkedRecord(payload.fieldKey);
//     console.log('connection', connection)
//     const edges = connection.getLinkedRecords('edges');
//     const {teamId} = payload.args;
//     const team = store.get(teamId);
//     const contentFilter = team.getValue('contentFilter');
//     console.log('contentFilter', contentFilter)
//   }
// };
//
// export default FilteredProjectsHandler;
