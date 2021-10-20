import * as clusterfck from 'tayden-clusterfck'
import {GroupingOptions} from './groupReflections'

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
const MAX_GROUP_SIZE = 5
const MIN_REDUCTION_PERCENT = 0.01
const MAX_REDUCTION_PERCENT = 0.8

const traverseTree = (initialTree, groupingOptions: GroupingOptions) => {
  const groups = [] as any
  const distanceSet = new Set()
  const {groupingThreshold, maxGroupSize = MAX_GROUP_SIZE} = groupingOptions
  const visit = (tree, group?) => {
    if (tree.dist) {
      distanceSet.add(tree.dist)
    }
    if (tree.value) {
      if (group) {
        group.push(tree.value)
      } else {
        groups.push([tree.value])
      }
    } else if (!group && tree.size <= maxGroupSize && tree.dist <= groupingThreshold) {
      const newGroup = []
      visit(tree.left, newGroup)
      visit(tree.right, newGroup)
      groups.push(newGroup)
    } else {
      visit(tree.left, group)
      visit(tree.right, group)
    }
  }
  visit(initialTree)
  return {groups, distanceSet}
}
const getGroupMatrix = (distanceMatrix, groupingOptions: GroupingOptions) => {
  const clusters = clusterfck.hcluster(distanceMatrix, clusterfck.euclidean, 'average')
  const {tree} = clusters
  const {groupingThreshold, maxReductionPercent = MAX_REDUCTION_PERCENT} = groupingOptions
  if (!tree) return {groups: []}
  let groups
  let thresh = groupingThreshold
  let distancesArr
  // naive logic to make sure the grouping is AOK
  for (let i = 0; i < 5; i++) {
    const res = traverseTree(tree, groupingOptions)
    groups = res.groups
    distancesArr = Array.from(res.distanceSet).sort()
    const reduction = (distanceMatrix.length - groups.length) / distanceMatrix.length
    if (reduction < MIN_REDUCTION_PERCENT) {
      // eslint-disable-next-line no-loop-func
      const nextDistance = distancesArr.find((d) => d > thresh)
      if (!nextDistance || nextDistance >= 1) break
      thresh = Math.ceil(nextDistance * 100) / 100
    } else if (reduction > maxReductionPercent) {
      // eslint-disable-next-line no-loop-func
      const nextDistance = distancesArr.find((d) => d < thresh)
      if (!nextDistance || nextDistance >= 1) break
      thresh = Math.floor(nextDistance * 100) / 100
    } else {
      break
    }
  }
  const nextDistance = distancesArr.find((d) => d > thresh)
  const nextThresh = nextDistance ? Math.ceil(nextDistance * 100) / 100 : null
  return {thresh, groups, nextThresh}
}

export default getGroupMatrix
