import * as clusterfck from 'tayden-clusterfck';


/*
 * Use hierarchical agglomerative clustering to group the reflections by theme
 * Since a group can have more than 2 cards, simpler techniques (e.g. blossom algorithm) are insufficient
 * because they only solve assignment problems.
 * a HAC is O(n^3), but has the following benefits over other clustering techniques:
 *  - No need to specific the number of cluster (e.g. k-means clustering)
 *  - Provides a distance between clusters, which serves as a threshold
 *  - Accepts any distance function (euclidean performs better than cosine on small datasets)
 *  - Returns a binary tree making it easy to establish a maximum group size
 *
 * Traverses the binary tree until the branch is found that is under the threshold
 * if the number of leaves is > MAX_GROUP_SIZE, go down a level & repeat, else commit to result array
 * Returns an array where each child represents a reflection group
 * Each child of the reflection group is the distinct distance vector for a reflection
 */
const MAX_GROUP_SIZE = 5;
const MIN_REDUCTION_PERCENT = 0.01;
const MAX_REDUCTION_PERCENT = 0.80;

const traverseTree = (initialTree, groupingThreshold) => {
  const groups = [];
  const visit = (tree, group) => {
    if (tree.value) {
      if (group) {
        group.push(tree.value);
      } else {
        groups.push([tree.value]);
      }
    } else if (!group && tree.size <= MAX_GROUP_SIZE && tree.dist <= groupingThreshold) {
      const newGroup = [];
      visit(tree.left, newGroup);
      visit(tree.right, newGroup);
      groups.push(newGroup);
    } else {
      visit(tree.left, group);
      visit(tree.right, group);
    }
  };
  visit(initialTree);
  return groups;
};
const getGroupMatrix = (distanceMatrix, groupingThreshold) => {
  const clusters = clusterfck.hcluster(distanceMatrix, clusterfck.euclidean, 'average');
  const {tree} = clusters;
  if (!tree) return {group: []};
  let group;
  let thresh = groupingThreshold;
  // naive logic to make sure the grouping is AOK
  for (let i = 0; i < 5; i++) {
    group = traverseTree(tree, thresh);
    const reduction = (distanceMatrix.length - group.length) / distanceMatrix.length;
    if (reduction < MIN_REDUCTION_PERCENT) {
      thresh += 0.09;
    } else if (reduction > MAX_REDUCTION_PERCENT) {
      thresh -= 0.1;
    } else {
      break;
    }
  }
  return {thresh, group};
};

export default getGroupMatrix;
