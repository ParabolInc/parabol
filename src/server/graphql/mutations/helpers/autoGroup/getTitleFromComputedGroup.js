/*
 * Determine the overall salience of each entity in a group by using a cumulative sum
 * Uses the most salient entities to create a 40-character theme to summarize the content of the reflections
 */


const SALIENT_THRESHOLD = 0.60;
const MIN_ENTITIES = 2;
const MAX_CHARS = 30;

const getTitleFromComputedGroup = (entityNameArr, group) => {
  const sumArr = new Array(entityNameArr.length).fill(0);
  group.forEach((reflectionDistanceArr) => {
    for (let jj = 0; jj < reflectionDistanceArr.length; jj++) {
      sumArr[jj] += reflectionDistanceArr[jj];
    }
  });

  const arrWithIdx = [];
  for (let i = 0; i < sumArr.length; i++) {
    arrWithIdx[i] = [sumArr[i], i];
  }
  // add the existing idx & sort greatest to smallest so we can get the most salient entities
  arrWithIdx.sort((a, b) => a[0] < b[0] ? 1 : -1);
  let cumlSalience = 0;
  const titleArr = [];
  for (let ii = 0; ii < arrWithIdx.length; ii++) {
    const [totalSalience, idx] = arrWithIdx[ii];
    const name = entityNameArr[idx];
    const capName = name[0].toUpperCase() + name.slice(1);
    // if we've used 2 words & adding this word would make it look long & ugly, abort
    if (titleArr.length > MIN_ENTITIES && titleArr.join(' ').length + capName.length > MAX_CHARS) {
      break;
    }
    titleArr.push(capName);
    cumlSalience += totalSalience / group.length;
    // if they get the jist, abort
    if (cumlSalience > SALIENT_THRESHOLD) break;
  }
  return titleArr.join(' ');
};

export default getTitleFromComputedGroup;
