// mutatively remove fields from a snapshot that will always be changing

const visitArray = (snapshot, path) => {
  for (let i = 0; i < snapshot.length; i++) {
    const arrObj = snapshot[i];
    visitSnapshot(arrObj, path);
  }
};

const visitObject = (snapshot, path) => {
  const nextLayer = path[0];
  if (path.length === 1) {
    snapshot[nextLayer] = null;
    return;
  }
  visitSnapshot(snapshot[nextLayer], path.slice(1))
};

const visitSnapshot = (snapshot, path) => {
  const func = Array.isArray(snapshot) ? visitArray : visitObject;
  func(snapshot, path);
};

export default function trimSnapshot(snapshot, uids) {
  for (let i = 0; i < uids.length; i++) {
    const uid = uids[i];
    const path = uid.split('.');
    visitSnapshot(snapshot, path);
  }
  return snapshot;
}
