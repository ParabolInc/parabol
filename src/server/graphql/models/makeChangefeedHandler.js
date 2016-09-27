import jsonEqual from 'universal/utils/jsonEqual';

const handleRethinkAdd = newVal => {
  return {
    type: 'add',
    fields: newVal
  };
};

const handleRethinkRemove = (doc, removalFields = ['id']) => {
  const fields = {};
  for (let i = 0; i < removalFields.length; i++) {
    const removalField = removalFields[i];
    fields[removalField] = doc[removalField];
  }
  return {
    type: 'remove',
    fields
  };
};

const handleRethinkUpdate = (doc) => {
  const oldVals = doc.old_val;
  const newVals = doc.new_val;
  const oldFields = Object.keys(oldVals);
  const newFields = Object.keys(newVals);
  const removeKeys = [];
  const diff = {};
  for (let i = 0; i < oldFields.length; i++) {
    const key = oldFields[i];
    if (!newVals.hasOwnProperty(key)) {
      removeKeys.push(key);
    }
  }
  for (let i = 0; i < newFields.length; i++) {
    const key = newFields[i];
    const oldVal = oldVals[key];
    const newVal = newVals[key];
    if (oldVal === newVal || jsonEqual(oldVal, newVal)) {
      continue;
    }
    diff[key] = newVal;
  }
  diff.id = oldVals.id;
  const payload = {
    type: 'update',
    fields: diff
  };
  if (removeKeys.length) {
    payload.removeKeys = removeKeys;
  }
  return payload;
};

const handleRethinkChangefeed = (doc, removalFields) => {
  if (!doc.old_val || Object.keys(doc.old_val).length === 0) {
    return handleRethinkAdd(doc.new_val);
  } else if (!doc.new_val || Object.keys(doc.new_val).length === 0) {
    return handleRethinkRemove(doc.old_val, removalFields);
  }
  return handleRethinkUpdate(doc);
};


export default function makeChangefeedHandler(socket, subbedChannelName, options = {}) {
  const {removalFields} = options;
  return (err, cursor) => {
    if (err) throw err;
    cursor.each((error, data) => {
      if (error) throw error;
      const payload = handleRethinkChangefeed(data, removalFields);
      socket.emit(subbedChannelName, payload);
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === subbedChannelName) {
        cursor.close();
      }
    });
  };
}
