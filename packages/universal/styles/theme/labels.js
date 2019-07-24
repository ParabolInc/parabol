import brand from './brand'
import appTheme from './appTheme'
import {ACTIVE, STUCK, DONE, FUTURE} from '../../utils/constants'

const stateColor = {
  done: '#7C5FB0', // variant of primary purple, TODO: needs approximate generated palette value
  stuck: '#FE7168', // variant of primary orange, TODO: needs approximate generated palette value
  future: appTheme.palette.cool, // brand.primary.teal
  active: brand.secondary.green, // TODO: needs generated palette value
  archive: '#A2A1AC', // TODO: needs generated palette value (gray variant)
  private: brand.secondary.yellow // TODO: needs generated palette value
}

const ARCHIVED = {
  color: stateColor.archive,
  label: 'Archived',
  slug: 'archived'
}

const labels = {
  taskStatus: {
    slugs: [DONE, ACTIVE, STUCK, FUTURE],
    [ACTIVE]: {
      color: stateColor.active,
      label: 'Active',
      slug: ACTIVE
    },
    [STUCK]: {
      color: stateColor.stuck,
      label: 'Stuck',
      slug: STUCK
    },
    [DONE]: {
      color: stateColor.done,
      label: 'Done',
      slug: DONE
    },
    [FUTURE]: {
      color: stateColor.future,
      label: 'Future',
      slug: FUTURE
    },
    archived: {
      ...ARCHIVED
    },
    private: {
      color: stateColor.private,
      label: 'Future',
      slug: FUTURE
    }
  },
  archive: {
    color: stateColor.archive,
    label: 'Archive',
    slug: 'archive'
  },
  archived: {
    ...ARCHIVED
  },
  task: {
    color: appTheme.palette.dark,
    label: 'Task',
    slug: 'task'
  }
}

export default labels
