let tempId = 0;

// const isRelayScalarValue = (val) => {
//  return (typeof val !== 'object');
// };
//
// const getSetMethod = (val) => {
//  if (isRelayScalarValue(val)) return 'setValue';
//  if (Array.isArray(val)) {
//    return isRelayScalarValue(val[0]) ? 'setValue' : 'setLinkedRecords';
//  }
//  return 'setLinkedRecord';
// };

const createProxyRecord = (store, type, record) => {
  const id = `client:${type}:${tempId++}`;
  const newRecord = store.create(id, type);
  // default to this
  newRecord.setValue(id, 'id');
  const keys = Object.keys(record);
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii];
    const val = record[key];
    // const setMethod = getSetMethod(val);
    newRecord.setValue(val, key);
  }
  return newRecord;
};

export default createProxyRecord;
