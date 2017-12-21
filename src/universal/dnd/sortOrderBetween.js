// @flow

import type {Project} from 'universal/types/project';
import {SORT_STEP} from 'universal/utils/constants';
import dndNoise from 'universal/utils/dndNoise';

type Options = {
  isInsert: ?boolean,
  boundedOffset: ?number
};

/**
 * Computes the sort order of a dragged project
 */
export default function sortOrderBetween(projects: Array<Project>, desiredIdx: number, options: Options = {}): number {
  if (projects.length === 0) {
    return SORT_STEP + dndNoise();
  }
  if (desiredIdx === 0) {
    return projects[0].sortOrder + SORT_STEP + dndNoise();
  }

  const {isInsert} = options;
  const boundedOffset = isInsert ? -1 : options.boundedOffset;
  const maxLen = projects.length + (isInsert ? 0 : -1);
  if (desiredIdx === maxLen) {
    return projects[projects.length - 1].sortOrder - SORT_STEP + dndNoise();
  }
  return (projects[desiredIdx].sortOrder + projects[desiredIdx + boundedOffset].sortOrder) / 2 + dndNoise();
}
