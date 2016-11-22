
// ui.js
// NOTE: Just normalizing some UI style properties here. (TA)

import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';
import zIndexScale from 'universal/styles/helpers/zIndexScale';

const backgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 95).toHexString();

const ui = {
  // Action items and cards
  actionCardBgColor: appTheme.palette.light60l,
  actionCardBgActive: 'rgba(255, 255, 255, .85)',
  zActionItem: zIndexScale(6),

  // Breakpoints
  breakpoint: {
    wide: '@media (min-width: 90rem)',
    wider: '@media (min-width: 100rem)',
    widest: '@media (min-width: 120rem)'
  },

  // Cards
  cardBorderColor: appTheme.palette.mid30l,
  cardBorderRadius: '.25rem',
  cardMaxWidth: '17.5rem',
  cardMinHeight: '7.5rem',
  cardPaddingBase: '.5rem',
  cardDragStyle: {
    backgroundColor: appTheme.palette.light10l,
    borderColor: appTheme.palette.mid70l,
    borderRadius: '.25rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, .15)'
  },
  zCard: zIndexScale(6),

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
  zMenu: zIndexScale(4),

  // Project columns
  projectColumnsMaxWidth: '78.25rem',
  projectColumnsMinWidth: '48rem',

  // Generic zIndex scale
  z1: zIndexScale(1),
  z2: zIndexScale(2),
  z3: zIndexScale(4),
  z5: zIndexScale(5),
  z6: zIndexScale(6),
  z7: zIndexScale(7),
  z8: zIndexScale(8),
  z9: zIndexScale(9),
  z10: zIndexScale(10)
};

export default ui;
