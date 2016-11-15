
// ui.js
// NOTE: Just normalizing some UI style properties here. (TA)

import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';

const backgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 95).toHexString();

const ui = {
  // Action cards
  actionCardBgColor: appTheme.palette.light60l,
  actionCardBgActive: 'rgba(255, 255, 255, .85)',

  // Breakpoints
  breakpoint: {
    wide: '@media (min-width: 90rem)',
    wider: '@media (min-width: 100rem)',
    widest: '@media (min-width: 120rem)'
  },

  // Cards
  cardBorderColor: appTheme.palette.mid30l,
  cardBorderRadius: '.25rem',
  cardMinHeight: '7.5rem',
  cardPaddingBase: '.5rem',

  // Dashboards
  dashActionsWidth: '15rem',
  dashAgendaWidth: '15rem',
  dashBackgroundColor: backgroundColor,
  dashBorderColor: 'rgba(0, 0, 0, .1)',
  dashGutter: '1rem',
  // Note: property 'dashMinWidth' prevents layout from collapsing in Safari
  //       in a better future we may be more adaptive/responsive (TA)
  dashMinWidth: '79rem',
  dashSectionHeaderLineHeight: '1.875rem',
  dashSidebarWidth: '15rem',

  // Email
  emailBackgroundColor: backgroundColor,
  emailFontFamily: '"Karla", "Helvetica Neue", serif',
  emailRuleColor: appTheme.palette.mid20l,
  emailTableBase: {
    borderCollapse: 'collapse',
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  // Fields
  fieldLabelGutter: '.5rem',
  fieldPaddingHorizontal: '.75rem',

  // Icons
  iconSize: '14px', // FontAwesome base
  iconSize2x: '28px', // FontAwesome 2x
  iconSize3x: '42px', // FontAwesome 3x

  // Meeting
  meetingSidebarWidth: '15rem',

  // Menus
  menuBackgroundColor: backgroundColor,

  // Project columns
  projectColumnsMaxWidth: '80rem',
  projectColumnsMinWidth: '48rem'
};

export default ui;
