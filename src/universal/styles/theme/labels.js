import React from 'react';
import theme from 'universal/styles/theme';

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
      'active',
      'stuck',
      'done',
      'future'
    ],
    active: {
      color: theme.palette.cool,
      icon: 'arrow-right',
      keystroke: 'a',
      label: 'Active',
      shortcutLabel: <span><u>A</u>ctive</span>,
      slug: 'active'
    },
    stuck: {
      color: theme.palette.warm,
      icon: 'exclamation-triangle',
      keystroke: 's',
      label: 'Stuck',
      shortcutLabel: <span><u>S</u>tuck</span>,
      slug: 'stuck'
    },
    done: {
      color: theme.palette.dark10d,
      icon: 'check',
      keystroke: 'd',
      label: 'Done',
      shortcutLabel: <span><u>D</u>one</span>,
      slug: 'done'
    },
    future: {
      color: theme.palette.mid,
      icon: 'clock-o',
      keystroke: 'f',
      label: 'Future',
      shortcutLabel: <span><u>F</u>uture</span>,
      slug: 'future'
    }
  },
  archive: {
    color: theme.palette.dark,
    icon: 'archive',
    keystroke: 'c',
    label: 'Archive',
    shortcutLabel: <span>Ar<u>c</u>hive</span>,
    slug: 'archive'
  },
  archived: {
    color: theme.palette.dark,
    icon: 'archive',
    keystroke: 'c',
    label: 'Archived',
    shortcutLabel: <span>Ar<u>c</u>hived</span>,
    slug: 'archived'
  }
};

export default labels;
