import {UPDATE} from 'universal/utils/constants';

const MergeHandler = {
  update(store, payload) {
    console.log('payload', payload);
    const record = store.get(payload.dataID);
    if (!record) return;

    const serverFields = record.getLinkedRecords(payload.fieldKey);
    if (!serverFields)


    // get the teamId
    // get the contentFilter for that teamId
    // if the contentFilter is not blank,
    // serverFields.setLinkedRecords(filteredList, payload.handleKey)
      }
};

export default MergeHandler;
