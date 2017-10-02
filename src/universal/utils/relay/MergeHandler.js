import {UPDATE} from 'universal/utils/constants';

const MergeHandler = {
  update(store, payload) {
    const record = store.get(payload.dataID);
    if (!record) return;

    const type = record.getLinkedRecordID('type');
    if (type !== UPDATE) return;

    const serverField = record.getLinkedRecord(payload.fieldKey);
    if (!serverField) return;

    const updatedId = serverField.getDataID();
    const clientRecord = store.__mutator._base.get(updatedId);
    const serverDiff = store.__mutator._getSinkRecord(updatedId);
    const keys = Object.keys(serverDiff);
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii];
      if (serverDiff[key] === null) {
        store.__mutator.setValue(updatedId, key, clientRecord[key]);
      }
    }
  }
};

export default MergeHandler;
