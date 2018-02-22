import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

export default function taskStatusStyles(propertyNameString, suffix = '') {
  return {
    [`${ACTIVE}${suffix}`]: {
      [propertyNameString]: labels.taskStatus[ACTIVE].color
    },

    [`${STUCK}${suffix}`]: {
      [propertyNameString]: labels.taskStatus[STUCK].color
    },

    [`${DONE}${suffix}`]: {
      [propertyNameString]: labels.taskStatus[DONE].color
    },

    [`${FUTURE}${suffix}`]: {
      [propertyNameString]: labels.taskStatus[FUTURE].color
    }
  };
}
