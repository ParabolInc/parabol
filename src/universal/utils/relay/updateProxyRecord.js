const updateProxyRecord = (proxyRecord, updatedRecord) => {
  const keys = Object.keys(updatedRecord);
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii];
    const val = updatedRecord[key];
    proxyRecord.setValue(val, key);
  }
  return proxyRecord;
};

export default updateProxyRecord;
