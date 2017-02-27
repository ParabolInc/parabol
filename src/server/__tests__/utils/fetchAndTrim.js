import trimFields from 'server/__tests__/utils/trimFields';

export default async function fetchAndTrim(promiseObj, trimSnapshot) {
  const keys = Object.keys(promiseObj);
  const values = Object.values(promiseObj);
  const docs = await Promise.all(values);
  const snapshot = {};
  for (let i = 0; i < docs.length; i++) {
    const key = keys[i];
    const doc = docs[i];
    if (!trimFields[key]) {
      throw new Error(`BAD MOCK: No trimFields for DB table ${key}`);
    }
    snapshot[key] = trimSnapshot.trim(doc, trimFields[key]);
  }
  return snapshot;
}
