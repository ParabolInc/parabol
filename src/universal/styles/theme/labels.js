import appTheme from 'universal/styles/theme/appTheme';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

const labels = {
  taskStatus: {
    slugs: [
      DONE,
      ACTIVE,
      STUCK,
      FUTURE
    ],
    [ACTIVE]: {
      color: appTheme.palette.cool,
      icon: 'arrow-right',
      label: 'Active',
      slug: ACTIVE
    },
    [STUCK]: {
      color: appTheme.palette.warm,
      icon: 'exclamation-triangle',
      label: 'Stuck',
      slug: STUCK
    },
    [DONE]: {
      color: appTheme.palette.dark,
      icon: 'check',
      label: 'Done',
      slug: DONE
    },
    [FUTURE]: {
      color: appTheme.palette.mid,
      icon: 'clock-o',
      label: 'Future',
      slug: FUTURE
    }
  },
  archive: {
    color: appTheme.palette.dark10d,
    icon: 'archive',
    label: 'Archive',
    slug: 'archive'
  },
  archived: {
    color: appTheme.palette.dark10d,
    icon: 'archive',
    label: 'Archived',
    slug: 'archived'
  },
  task: {
    color: appTheme.palette.dark,
    icon: 'calendar',
    label: 'Task',
    slug: 'task'
  }
};

export default labels;
