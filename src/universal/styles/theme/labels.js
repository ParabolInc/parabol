import brand from 'universal/styles/theme/brand';
import appTheme from 'universal/styles/theme/appTheme';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

const stateColor = {
  done: '#7C5FB0', // variant of primary purple, TODO: needs approximate generated palette value
  stuck: '#FE7168', // variant of primary orange, TODO: needs approximate generated palette value
  future: appTheme.palette.cool, // brand.primary.teal
  active: brand.secondary.green, // TODO: needs generated palette value
  archive: '#A2A1AC', // TODO: needs generated palette value (gray variant)
  private: brand.secondary.yellow // TODO: needs generated palette value
};

const ARCHIVED = {
  color: stateColor.archive,
  icon: 'archive',
  label: 'Archived',
  slug: 'archived'
};

const labels = {
  taskStatus: {
    slugs: [
      DONE,
      ACTIVE,
      STUCK,
      FUTURE
    ],
    [ACTIVE]: {
      color: stateColor.active,
      icon: 'arrow-right',
      label: 'Active',
      slug: ACTIVE
    },
    [STUCK]: {
      color: stateColor.stuck,
      icon: 'exclamation-triangle',
      label: 'Stuck',
      slug: STUCK
    },
    [DONE]: {
      color: stateColor.done,
      icon: 'check',
      label: 'Done',
      slug: DONE
    },
    [FUTURE]: {
      color: stateColor.future,
      icon: 'clock-o',
      label: 'Future',
      slug: FUTURE
    },
    ...ARCHIVED,
    private: {
      color: stateColor.private,
      icon: 'clock-o',
      label: 'Future',
      slug: FUTURE
    }
  },
  archive: {
    color: stateColor.archive,
    icon: 'archive',
    label: 'Archive',
    slug: 'archive'
  },
  ...ARCHIVED,
  task: {
    color: appTheme.palette.dark,
    icon: 'calendar',
    label: 'Task',
    slug: 'task'
  }
};

export default labels;
