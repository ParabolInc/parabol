import trimFields from 'server/__tests__/utils/trimFields';
import trimSnapshot from 'server/__tests__/utils/trimSnapshot';

export default async function fetchAndTrim(promiseObj) {
  const keys = Object.keys(promiseObj);
  const values = Object.values(promiseObj);
  const docs = await Promise.all(values);
  return docs.map((doc, idx) => trimSnapshot(doc, trimFields[keys[idx]]));
}
