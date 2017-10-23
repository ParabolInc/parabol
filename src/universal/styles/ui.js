// -----------------------------------------------------------------------------
// ui.js
// -----------------------------------------------------------------------------

import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import zIndexScale from 'universal/styles/helpers/zIndexScale';

// Reusable constants for UI object
// -----------------------------------------------------------------------------

// Control sizes (used by buttons and fields)
const CONTROL_SIZE_SMALL = 'small';
const CONTROL_SIZE_MEDIUM = 'medium';
const CONTROL_SIZE_LARGE = 'large';

const CONTROL_SMALL_FONT_SIZE = '.875rem';
const CONTROL_SMALL_LINE_HEIGHT = '1.25rem';
const CONTROL_SMALL_PADDING_HORIZONTAL = '.4375rem';
const CONTROL_SMALL_BLOCK_PADDING_HORIZONTAL = '.5rem';
const CONTROL_SMALL_PADDING_VERTICAL = '.3125rem';
const CONTROL_SMALL_BLOCK_PADDING_VERTICAL = '.375rem';

const CONTROL_MEDIUM_FONT_SIZE = '1rem';
const CONTROL_MEDIUM_LINE_HEIGHT = '1.5rem';
const CONTROL_MEDIUM_PADDING_HORIZONTAL = '.6875rem';
const CONTROL_MEDIUM_BLOCK_PADDING_HORIZONTAL = '.75rem';
const CONTROL_MEDIUM_PADDING_VERTICAL = '.4375rem';
const CONTROL_MEDIUM_BLOCK_PADDING_VERTICAL = '.5rem';

const CONTROL_LARGE_FONT_SIZE = '1.125rem';
const CONTROL_LARGE_LINE_HEIGHT = '1.75rem';
const CONTROL_LARGE_PADDING_HORIZONTAL = '.9375rem';
const CONTROL_LARGE_BLOCK_PADDING_HORIZONTAL = '1rem';
const CONTROL_LARGE_PADDING_VERTICAL = '.6875rem';
const CONTROL_LARGE_BLOCK_PADDING_VERTICAL = '.75rem';

// Colors
const {cool, warm, dark, mid, light} = appTheme.palette;
const backgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 95).toHexString();

// Small border radius for controls (inputs, buttons, etcs.)
const borderRadiusSmall = '.125rem';
// Medium border radius for grouped components (cards, panels, etc.)
const borderRadiusMedium = '.25rem';
// Large border radius for larger components (modals, pages, etc.)
const borderRadiusLarge = '.5rem';

// Buttons
const BUTTON_SIZE_SMALL = CONTROL_SIZE_SMALL;
const BUTTON_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM;
const BUTTON_SIZE_LARGE = CONTROL_SIZE_LARGE;

// Color palette
const white = '#fff';
const gray = appTheme.palette.mid20l;
const PALETTE_OPTIONS = [
  'cool',
  'warm',
  'dark',
  'mid',
  'light',
  'white',
  'gray'
];
const PALETTE_VALUES = {
  cool,
  warm,
  dark,
  mid,
  light,
  white,
  gray
};

// Fields
const FIELD_BOX_SHADOW = 'inset 0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)';
const FIELD_BOX_SHADOW_FOCUS = '0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)';
const FIELD_PADDING_HORIZONTAL = '.75rem';
const FIELD_PLACEHOLDER_COLOR = appTheme.palette.mid80l;
const FIELD_SIZE_SMALL = CONTROL_SIZE_SMALL;
const FIELD_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM;
const FIELD_SIZE_LARGE = CONTROL_SIZE_LARGE;

// Filter
const filterBlur = 'blur(1.5px)';

// Icons
const iconSize = '14px'; // FontAwesome base
const iconSizeAvatar = '21px'; // FontAwesome 1.5x
const iconSize2x = '28px'; // FontAwesome 2x
const iconSize3x = '42px'; // FontAwesome 3x

// Modals
const MODAL_LAYOUT_MAIN = 'main';
const MODAL_LAYOUT_MAIN_WITH_DASH_ALERT = 'mainHasDashAlert';
const MODAL_LAYOUT_MAIN_WITH_DASH_ALERTS = 'mainHasDashAlerts';
const MODAL_LAYOUT_VIEWPORT = 'viewport';

// Panels
const panelInnerBorderColor = appTheme.palette.mid30l;

// Transitions
// NOTE: increases on a scale of 2x
const transition = [
  '100ms ease-in',
  '200ms ease-in',
  '400ms ease-in',
  '800ms ease-in',
  '1600ms ease-in',
  '3200ms ease-in'
];

// Shadows
// NOTE: levels increase on a scale of 2x
const shadow = [
  '0 .0625rem .125rem rgba(0, 0, 0, .25), 0 0 .0625rem rgba(0, 0, 0, .15)',
  '0 .125rem .25rem rgba(0, 0, 0, .25), 0 0 .0625rem rgba(0, 0, 0, .15)',
  '0 .25rem .5rem rgba(0, 0, 0, .25), 0 0 .0625rem rgba(0, 0, 0, .15)',
  '0 .5rem 1rem rgba(0, 0, 0, .25), 0 0 .0625rem rgba(0, 0, 0, .15)',
  '0 1rem 2rem rgba(0, 0, 0, .25), 0 0 .0625rem rgba(0, 0, 0, .15)'
];

// -----------------------------------------------------------------------------

const ui = {
  // Base settings
  // ---------------------------------------------------------------------------
  backgroundColor,
  borderRadiusSmall,
  borderRadiusMedium,
  borderRadiusLarge,
  paletteOptions: PALETTE_OPTIONS,
  palette: PALETTE_VALUES,
  filterBlur,

  // Private projects
  // ---------------------------------------------------------------------------
  privateCardBgColor: appTheme.palette.light60l,

  // Avatars
  // ---------------------------------------------------------------------------
  avatarDefaultBoxShadow: '0 0 1px 1px rgba(0, 0, 0, .2)',

  // Breakpoints
  // ---------------------------------------------------------------------------
  breakpoint: {
    wide: '@media (min-width: 90rem)',
    wider: '@media (min-width: 100rem)',
    widest: '@media (min-width: 120rem)'
  },

  // Buttons
  // ---------------------------------------------------------------------------
  buttonBaseStyles: {
    appearance: 'none',
    border: '.0625rem solid transparent',
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: appTheme.typography.sansSerif,
    fontWeight: 700,
    outline: 'none',
    textAlign: 'center',
    textDecoration: 'none',
    transition: `transform ${transition[0]}`,
    userSelect: 'none',
    verticalAlign: 'middle',
    ':hover': {
      boxShadow: shadow[0],
      textDecoration: 'none'
    },
    ':focus': {
      boxShadow: shadow[0],
      textDecoration: 'none'
    }
  },
  buttonBlockStyles: {
    display: 'block',
    paddingLeft: '.5em',
    paddingRight: '.5em',
    width: '100%'
  },
  buttonBorderRadius: borderRadiusSmall,
  buttonDisabledStyles: {
    cursor: 'not-allowed',
    opacity: '.5',
    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    },
    ':active': {
      animation: 'none'
    }
  },
  buttonSizeOptions: [
    BUTTON_SIZE_SMALL,
    BUTTON_SIZE_MEDIUM,
    BUTTON_SIZE_LARGE
  ],
  buttonSizeStyles: {
    [BUTTON_SIZE_SMALL]: {
      fontSize: CONTROL_SMALL_FONT_SIZE,
      lineHeight: CONTROL_SMALL_LINE_HEIGHT,
      padding: `${CONTROL_SMALL_PADDING_VERTICAL} 1em`
    },
    [BUTTON_SIZE_MEDIUM]: {
      fontSize: CONTROL_MEDIUM_FONT_SIZE,
      lineHeight: CONTROL_MEDIUM_LINE_HEIGHT,
      padding: `${CONTROL_MEDIUM_PADDING_VERTICAL} 1em`
    },
    [BUTTON_SIZE_LARGE]: {
      fontSize: CONTROL_LARGE_FONT_SIZE,
      lineHeight: CONTROL_LARGE_LINE_HEIGHT,
      padding: `${CONTROL_LARGE_PADDING_VERTICAL} 1em`
    }
  },

  // Cards
  // ---------------------------------------------------------------------------
  cardBorderColor: appTheme.palette.mid30l,
  cardBorderRadius: borderRadiusMedium,
  cardButtonHeight: '1.5rem',
  cardMaxWidth: '17.5rem',
  cardMinHeight: '6.875rem',
  cardPaddingBase: '.5rem',
  cardDragStyle: {
    boxShadow: shadow[3]
  },

  // CTA Panels
  // ---------------------------------------------------------------------------
  ctaPanelButtonSize: BUTTON_SIZE_LARGE,

  // Controls
  // ---------------------------------------------------------------------------
  controlBlockPaddingHorizontal: {
    [CONTROL_SIZE_SMALL]: CONTROL_SMALL_BLOCK_PADDING_HORIZONTAL,
    [CONTROL_SIZE_MEDIUM]: CONTROL_MEDIUM_BLOCK_PADDING_HORIZONTAL,
    [CONTROL_SIZE_LARGE]: CONTROL_LARGE_BLOCK_PADDING_HORIZONTAL
  },

  controlBlockPaddingVertical: {
    [CONTROL_SIZE_SMALL]: CONTROL_SMALL_BLOCK_PADDING_VERTICAL,
    [CONTROL_SIZE_MEDIUM]: CONTROL_MEDIUM_BLOCK_PADDING_VERTICAL,
    [CONTROL_SIZE_LARGE]: CONTROL_LARGE_BLOCK_PADDING_VERTICAL
  },

  // Dashboards
  // ---------------------------------------------------------------------------
  dashAgendaWidth: '15.125rem',
  dashBackgroundColor: backgroundColor,
  dashBorderColor: 'rgba(0, 0, 0, .1)',
  dashGutter: '1rem',
  // Note: property 'dashMinWidth' prevents layout from collapsing in Safari
  //       in a better future we may be more adaptive/responsive (TA)
  dashHeaderTitleStyles: {
    color: appTheme.palette.dark,
    fontSize: '1.75rem',
    fontWeight: 400,
    lineHeight: '1.5'
  },
  dashMinWidth: '79rem',
  dashAlertHeight: '2.625rem',
  dashAlertsHeight: '5.25rem',
  dashSectionHeaderLineHeight: '2rem',
  dashSidebarBackgroundColor: appTheme.palette.mid,
  dashSidebarWidth: '15rem',
  draftModalMargin: 32,

  // Email
  // ---------------------------------------------------------------------------
  emailBackgroundColor: backgroundColor,
  emailFontFamily: '"Karla", "Helvetica Neue", serif',
  emailRuleColor: appTheme.palette.mid20l,
  emailTableBase: {
    borderCollapse: 'collapse',
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  // Fields
  // ---------------------------------------------------------------------------
  fieldBaseStyles: {
    appearance: 'none',
    border: '.0625rem solid transparent',
    borderRadius: borderRadiusSmall,
    boxShadow: FIELD_BOX_SHADOW,
    display: 'block',
    fontFamily: appTheme.typography.sansSerif,
    fontSize: appTheme.typography.sBase,
    lineHeight: '1.5em',
    margin: '0',
    outline: 0,
    padding: `.25em ${FIELD_PADDING_HORIZONTAL}`,
    width: '100%'
  },
  fieldBoxShadow: FIELD_BOX_SHADOW,
  fieldFocusBoxShadow: FIELD_BOX_SHADOW_FOCUS,
  fieldColorPalettes: {
    cool: {
      backgroundColor: appTheme.palette.cool10l,
      borderColor: appTheme.palette.cool40l,
      color: appTheme.palette.cool,
      focusBorderColor: appTheme.palette.cool80l,
      placeholder: makePlaceholderStyles(appTheme.palette.cool70l),
      selection: appTheme.palette.cool20l
    },
    gray: {
      backgroundColor: appTheme.palette.mid10l,
      borderColor: appTheme.palette.mid40l,
      color: appTheme.palette.dark,
      focusBorderColor: appTheme.palette.mid80l,
      placeholder: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR),
      selection: appTheme.palette.mid20l
    },
    link: {
      backgroundColor: appTheme.palette.mid10l,
      borderColor: appTheme.palette.mid40l,
      color: appTheme.palette.cool,
      focusBorderColor: appTheme.palette.mid80l,
      placeholder: makePlaceholderStyles(appTheme.palette.cool70l),
      selection: appTheme.palette.cool20l
    },
    warm: {
      backgroundColor: appTheme.palette.warm10l,
      borderColor: appTheme.palette.warm40l,
      color: appTheme.palette.warm,
      focusBorderColor: appTheme.palette.warm80l,
      placeholder: makePlaceholderStyles(appTheme.palette.warm70l),
      selection: appTheme.palette.warm20l
    },
    white: {
      backgroundColor: '#fff',
      borderColor: appTheme.palette.mid40l,
      color: appTheme.palette.dark,
      focusBorderColor: appTheme.palette.mid80l,
      placeholder: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR),
      selection: appTheme.palette.mid20l
    }
  },
  fieldDisabled: {
    cursor: 'not-allowed',
    opacity: '.5'
  },
  fieldSizeOptions: [
    FIELD_SIZE_SMALL,
    FIELD_SIZE_MEDIUM,
    FIELD_SIZE_LARGE
  ],
  fieldSizeStyles: {
    [FIELD_SIZE_SMALL]: {
      fontSize: CONTROL_SMALL_FONT_SIZE,
      lineHeight: CONTROL_SMALL_LINE_HEIGHT,
      padding: `${CONTROL_SMALL_PADDING_VERTICAL} ${CONTROL_SMALL_PADDING_HORIZONTAL}`
    },
    [FIELD_SIZE_MEDIUM]: {
      fontSize: CONTROL_MEDIUM_FONT_SIZE,
      lineHeight: CONTROL_MEDIUM_LINE_HEIGHT,
      padding: `${CONTROL_MEDIUM_PADDING_VERTICAL} ${CONTROL_MEDIUM_PADDING_HORIZONTAL}`
    },
    [FIELD_SIZE_LARGE]: {
      fontSize: CONTROL_LARGE_FONT_SIZE,
      lineHeight: CONTROL_LARGE_LINE_HEIGHT,
      padding: `${CONTROL_LARGE_PADDING_VERTICAL} ${CONTROL_LARGE_PADDING_HORIZONTAL}`
    }
  },
  fieldReadOnly: {
    cursor: 'default'
  },
  fieldLabelGutter: '.5rem',
  fieldPaddingHorizontal: FIELD_PADDING_HORIZONTAL,
  fieldPlaceholderColor: FIELD_PLACEHOLDER_COLOR,
  fieldErrorBorderColor: appTheme.palette.warm90a,
  fieldErrorPlaceholderColor: appTheme.palette.warm90a,

  // Icons
  // ---------------------------------------------------------------------------
  iconSize,
  iconSizeAvatar,
  iconSize2x,
  iconSize3x,

  // Integrations
  // ---------------------------------------------------------------------------

  // Invoice
  // ---------------------------------------------------------------------------
  invoiceBorderColor: appTheme.palette.mid40l,
  invoiceBorderColorLighter: appTheme.palette.mid20l,
  invoiceBreakpoint: '@media (min-width: 32rem)',
  invoiceItemBaseStyles: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  },
  invoicePanelGutterSmall: '.75rem',
  invoicePanelGutterLarge: '1.25rem',

  // Link
  // ---------------------------------------------------------------------------
  linkColor: appTheme.palette.cool,
  linkColorHover: tinycolor(appTheme.palette.cool).darken(15).toHexString(),

  // Meeting
  // ---------------------------------------------------------------------------
  meetingSidebarGutter: '.5rem',
  meetingSidebarWidth: '15rem',

  // Menus
  // ---------------------------------------------------------------------------
  menuBackgroundColor: '#fff',
  menuBorderColor: appTheme.palette.mid30l,
  menuBorderRadius: borderRadiusSmall,
  menuBoxShadow: shadow[3],
  menuGutterHorizontal: '1rem',
  menuGutterInner: '.75rem',
  menuGutterVertical: '.5rem',
  menuItemBackgroundColorHover: appTheme.palette.mid10l,
  menuItemBackgroundColorActive: appTheme.palette.mid20l,
  menuItemColor: appTheme.palette.dark,
  menuItemColorHoverActive: appTheme.palette.dark50d,
  menuItemHeight: '2rem',
  menuItemFontSize: '.9375rem',

  // Modals
  // ---------------------------------------------------------------------------
  modalBackdropBackgroundColor: 'rgba(78, 73, 95, .25)',
  modalBorderRadius: borderRadiusLarge,
  modalBoxShadow: `${shadow[4]}, 0 0 .0625rem rgba(0, 0, 0, .35)`,
  modalButtonSize: BUTTON_SIZE_MEDIUM,
  modalLayoutMain: MODAL_LAYOUT_MAIN,
  modalLayoutMainWithDashAlert: MODAL_LAYOUT_MAIN_WITH_DASH_ALERT,
  modalLayoutMainWithDashAlerts: MODAL_LAYOUT_MAIN_WITH_DASH_ALERTS,
  modalLayoutViewport: MODAL_LAYOUT_VIEWPORT,
  modalLayout: [
    MODAL_LAYOUT_MAIN,
    MODAL_LAYOUT_MAIN_WITH_DASH_ALERT,
    MODAL_LAYOUT_MAIN_WITH_DASH_ALERTS,
    MODAL_LAYOUT_VIEWPORT
  ],

  // Notifications
  // ---------------------------------------------------------------------------
  notificationButtonSize: BUTTON_SIZE_SMALL,

  // Panels
  // ---------------------------------------------------------------------------
  panelBorderColor: appTheme.palette.mid50l,
  panelInnerBorderColor,
  panelBorderRadius: borderRadiusMedium,
  panelGutter: '1rem',
  panelMarginVertical: '1.5rem',

  // Project columns
  // ---------------------------------------------------------------------------
  projectColumnsMaxWidth: '78.25rem',
  projectColumnsMinWidth: '48rem',

  // Providers
  // ---------------------------------------------------------------------------
  providers: {
    github: {
      description: 'Create GitHub issues from Parabol',
      color: '#333333',
      icon: 'github',
      providerName: 'GitHub'
    },
    slack: {
      description: 'Notify channels when meetings begin and end',
      color: '#6ecadc',
      icon: 'slack',
      providerName: 'Slack'
    }
  },
  providerIconBorderRadius: '.5rem', // 8px
  providerIconSize: '3.5rem', // 56px,
  providerName: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s6,
    lineHeight: appTheme.typography.s7
  },

  // Rows
  // ---------------------------------------------------------------------------
  rowBorderColor: panelInnerBorderColor,
  rowHeadingColor: appTheme.palette.dark,
  rowHeadingFontSize: appTheme.typography.s4,
  rowGutter: '1rem',
  rowSubheading: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s5
  },

  // Settings
  // ---------------------------------------------------------------------------
  settingsGutter: '1rem',
  settingsPanelMaxWidth: '42rem',

  // Shadows
  shadow,

  // Tags
  // ---------------------------------------------------------------------------
  tagFontSize: '.75rem',
  tagFontWeight: 700,
  tagGutter: '.75rem',
  tagHeight: '1rem',
  tagPadding: '0 .5rem',
  tagPalette: [
    'cool',
    'gray',
    'light',
    'warm',
    'white'
  ],

  // Tooltips
  // ---------------------------------------------------------------------------
  tooltipBorderRadius: borderRadiusSmall,
  tooltipBoxShadow: shadow[2],

  // Transitions
  // ---------------------------------------------------------------------------
  transition,

  // Generic zIndex scale
  // ---------------------------------------------------------------------------
  zi1: zIndexScale(1),
  zi2: zIndexScale(2),
  zi3: zIndexScale(3),
  zi4: zIndexScale(4),
  zi5: zIndexScale(5),
  zi6: zIndexScale(6),
  zi7: zIndexScale(7),
  zi8: zIndexScale(8),
  zi9: zIndexScale(9),
  zi10: zIndexScale(10),

  // …and then component-specific constants:

  ziMenu: zIndexScale(4),
  ziCardDragLayer: zIndexScale(6),
  ziRejoinFacilitatorButton: zIndexScale(4),
  ziTooltip: zIndexScale(4)
};

export default ui;
