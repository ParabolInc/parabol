import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

export default function projectStatusStyles(propertyNameString, suffix = '') {
  return {
    [`${ACTIVE}${suffix}`]: {
      [propertyNameString]: labels.projectStatus[ACTIVE].color
    },

    [`${STUCK}${suffix}`]: {
      [propertyNameString]: labels.projectStatus[STUCK].color
    },

    [`${DONE}${suffix}`]: {
      [propertyNameString]: labels.projectStatus[DONE].color
    },

    [`${FUTURE}${suffix}`]: {
      [propertyNameString]: labels.projectStatus[FUTURE].color
    }
  };
}
