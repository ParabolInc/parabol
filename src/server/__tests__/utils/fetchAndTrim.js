import trimFields from 'server/__tests__/utils/trimFields';
import trimSnapshot from 'server/__tests__/utils/trimSnapshot';

export default async function fetchAndTrim(promiseObj) {
  const keys = Object.keys(promiseObj);
  const values = Object.values(promiseObj);
  const docs = await Promise.all(values);
  const snapshot = {};
  for (let i = 0; i < docs.length; i++) {
    const key = keys[i];
    const doc = docs[i];
    snapshot[key] = trimSnapshot(doc, trimFields[key]);
  }
  return snapshot;
}
