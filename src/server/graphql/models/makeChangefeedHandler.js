import jsonEqual from 'universal/utils/jsonEqual';

const handleRethinkAdd = newVal => {
  return {
    type: 'add',
    fields: newVal
  };
};

const handleRethinkRemove = id => {
  return {
    type: 'remove',
    id
  };
};

const handleRethinkUpdate = (doc, path) => {
  const oldVals = doc.old_val;
  const newVals = doc.new_val;
  const changeKeys = [...Object.keys(oldVals), ...Object.keys(newVals)];
  const removeKeys = [];
  const diff = {};
  for (let i = 0; i < changeKeys.length; i++) {
    const key = changeKeys[i];

    // flag keys to remove
    if (!newVals.hasOwnProperty(key)) {
      removeKeys.push(key);
      continue;
    }

    // explicit check to ensure we send down falsy values
    if (!oldVals.hasOwnProperty(key)) {
      diff[key] = newVals[key];
      continue;
    }
    const oldVal = oldVals[key];
    const newVal = newVals[key];

    // don't send down unchanged values
    if (oldVal === newVal || jsonEqual(oldVal, newVal)) {
      continue;
    }
    diff[key] = newVals[key];
  }
  const payload = {
    type: 'update',
    fields: diff,
    removeKeys
  };
  if (path) {
    payload.path = `${path}[${payload.id}]`;
  }
  return payload;
};

const handleRethinkChangefeed = (doc, path) => {
  if (!doc.old_val || Object.keys(doc.old_val).length === 0) {
    return handleRethinkAdd(doc.new_val);
  } else if (!doc.new_val || Object.keys(doc.new_val).length === 0) {
    return handleRethinkRemove(doc.old_val.id);
  }
  return handleRethinkUpdate(doc, path);
};


export default function makeChangefeedHandler(socket, subbedChannelName, options = {}) {
  const {path} = options;
  return (err, cursor) => {
    if (err) throw err;
    cursor.each((error, data) => {
      if (error) throw error;
      const payload = handleRethinkChangefeed(data, path);
      socket.emit(subbedChannelName, payload);
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === subbedChannelName) {
        cursor.close();
      }
    });
  };
}
