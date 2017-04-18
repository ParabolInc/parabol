import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

const labels = {
  meetingPhase: {
    lobby: {
      label: 'Lobby',
      slug: 'lobby'
    },
    checkIn: {
      label: 'Check-In',
      slug: 'checkIn'
    },
    updates: {
      label: 'Updates',
      slug: 'updates'
    },
    agenda: {
      label: 'Agenda',
      slug: 'agenda'
    },
    summary: {
      label: 'Summary',
      slug: 'summary'
    }
  },
  projectStatus: {
    slugs: [
      DONE,
      ACTIVE,
      STUCK,
      FUTURE
    ],
    [ACTIVE]: {
      color: appTheme.palette.cool,
      icon: 'arrow-right',
      keystroke: 'a',
      label: 'Active',
      shortcutLabel: <span><u>A</u>ctive</span>,
      slug: ACTIVE
    },
    [STUCK]: {
      color: appTheme.palette.warm,
      icon: 'exclamation-triangle',
      keystroke: 's',
      label: 'Stuck',
      shortcutLabel: <span><u>S</u>tuck</span>,
      slug: STUCK
    },
    [DONE]: {
      color: appTheme.palette.dark,
      icon: 'check',
      keystroke: 'd',
      label: 'Done',
      shortcutLabel: <span><u>D</u>one</span>,
      slug: DONE
    },
    [FUTURE]: {
      color: appTheme.palette.mid,
      icon: 'clock-o',
      keystroke: 'f',
      label: 'Future',
      shortcutLabel: <span><u>F</u>uture</span>,
      slug: FUTURE
    }
  },
  archive: {
    color: appTheme.palette.dark10d,
    icon: 'archive',
    keystroke: 'c',
    label: 'Archive',
    shortcutLabel: <span>Ar<u>c</u>hive</span>,
    slug: 'archive'
  },
  archived: {
    color: appTheme.palette.dark10d,
    icon: 'archive',
    keystroke: 'c',
    label: 'Archived',
    shortcutLabel: <span>Ar<u>c</u>hived</span>,
    slug: 'archived'
  },
  action: {
    color: appTheme.palette.dark,
    icon: 'calendar-check-o',
    keystroke: 't',
    label: 'Action',
    shortcutLabel: <span>Ac<u>t</u>ion</span>,
    slug: 'action'
  },
  project: {
    color: appTheme.palette.dark,
    icon: 'calendar',
    keystroke: 'p',
    label: 'Project',
    shortcutLabel: <span><u>P</u>roject</span>,
    slug: 'project'
  }
};

export default labels;
