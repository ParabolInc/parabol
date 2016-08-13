import labels from 'universal/styles/theme/labels';

export default function projectStatusStyles(propertyNameString) {
  return {
    active: {
      [propertyNameString]: labels.projectStatus.active.color
    },

    stuck: {
      [propertyNameString]: labels.projectStatus.stuck.color
    },

    done: {
      [propertyNameString]: labels.projectStatus.done.color
    },

    future: {
      [propertyNameString]: labels.projectStatus.future.color
    }
  };
}
