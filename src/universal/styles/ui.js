
// -----------------------------------------------------------------------------
// ui.js
// -----------------------------------------------------------------------------

import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import zIndexScale from 'universal/styles/helpers/zIndexScale';

// Reusable constants for UI object
// -----------------------------------------------------------------------------

const {cool, warm, dark, mid, light} = appTheme.palette;
const backgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 95).toHexString();

// Small border radius for controls (inputs, buttons, etcs.)
const borderRadiusSmall = '.125rem';
// Medium border radius for grouped components (cards, panels, etc.)
const borderRadiusMedium = '.25rem';
// Large border radius for larger components (modals, pages, etc.)
const borderRadiusLarge = '.5rem';

// Button size constants
const BUTTON_SIZE_SMALLEST = 'smallest';
const BUTTON_SIZE_SMALL = 'small';
const BUTTON_SIZE_MEDIUM = 'medium';
const BUTTON_SIZE_LARGE = 'large';
const BUTTON_SIZE_LARGEST = 'largest';
const BUTTON_PADDING_HORIZONTAL_COMPACT = '.5em';

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

// Controls
// TODO: Define common control properties to be
//       shared across inputs, buttons, etc. (TA)

// Fields
const FIELD_BOX_SHADOW = 'inset 0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)';
const FIELD_BOX_SHADOW_FOCUS = '0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)';
const FIELD_PADDING_HORIZONTAL = '.75rem';
const FIELD_PLACEHOLDER_COLOR = appTheme.palette.mid80l;

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
const MODAL_LAYOUT_VIEWPORT = 'viewport';

// Transitions
const transitionFastest = '100ms ease-in';
const transitionFaster = '200ms ease-in';
const transitionFast = '400ms ease-in';
const transitionSlow = '800ms ease-in';
const transitionSlower = '1600ms ease-in';
const transitionSlowest = '3200ms ease-in';

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

  // Action items and cards
  // ---------------------------------------------------------------------------
  actionCardBgColor: appTheme.palette.light60l,
  actionCardBgActive: 'rgba(255, 255, 255, .85)',
  zActionItem: zIndexScale(6),

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
    border: '1px solid transparent',
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: appTheme.typography.sansSerif,
    fontWeight: 700,
    // lineHeight: '1.25em',
    outline: 'none',
    textAlign: 'center',
    textDecoration: 'none',
    transition: `opacity ${transitionFastest}`,
    userSelect: 'none',
    verticalAlign: 'middle',
    ':hover': {
      textDecoration: 'none'
    },
    ':focus': {
      textDecoration: 'none'
    },
    ':active': {
      animationDuration: '.1s',
      animationName: {
        '0%': {
          transform: 'translate(0, 0)'
        },
        '50%': {
          transform: 'translate(0, .25rem)'
        },
        '100%': {
          transform: 'translate(0)'
        }
      },
      animationTimingFunction: 'ease-in'
    }
  },
  buttonBlockStyles: {
    display: 'block',
    paddingLeft: BUTTON_PADDING_HORIZONTAL_COMPACT,
    paddingRight: BUTTON_PADDING_HORIZONTAL_COMPACT,
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
  buttonFontSize: {
    [BUTTON_SIZE_SMALLEST]: appTheme.typography.s3,
    [BUTTON_SIZE_SMALL]: appTheme.typography.s4,
    [BUTTON_SIZE_MEDIUM]: appTheme.typography.s5,
    [BUTTON_SIZE_LARGE]: '1.375rem',
    [BUTTON_SIZE_LARGEST]: appTheme.typography.s6
  },
  buttonIconSize: {
    [BUTTON_SIZE_SMALLEST]: iconSize,
    [BUTTON_SIZE_SMALL]: iconSize,
    [BUTTON_SIZE_MEDIUM]: iconSizeAvatar,
    [BUTTON_SIZE_LARGE]: iconSizeAvatar,
    [BUTTON_SIZE_LARGEST]: iconSize2x,
  },
  buttonLineHeight: '1.5em !important', // 2.5em
  buttonPadding: '.25em 1em',
  buttonPaddingHorizontalCompact: BUTTON_PADDING_HORIZONTAL_COMPACT,
  buttonSizes: [
    BUTTON_SIZE_SMALLEST,
    BUTTON_SIZE_SMALL,
    BUTTON_SIZE_MEDIUM,
    BUTTON_SIZE_LARGE,
    BUTTON_SIZE_LARGEST
  ],

  // Cards
  // ---------------------------------------------------------------------------
  cardBorderColor: appTheme.palette.mid30l,
  cardBorderRadius: borderRadiusMedium,
  cardMaxWidth: '17.5rem',
  cardMinHeight: '7.5rem',
  cardPaddingBase: '.5rem',
  cardDragStyle: {
    backgroundColor: appTheme.palette.light10l,
    borderColor: appTheme.palette.mid70l,
    borderRadius: borderRadiusMedium,
    boxShadow: '0 1px 2px rgba(0, 0, 0, .15)'
  },
  zCard: zIndexScale(6),

  // CTA Panels
  // ---------------------------------------------------------------------------
  ctaPanelButtonSize: BUTTON_SIZE_LARGE,

  // Dashboards
  // ---------------------------------------------------------------------------
  dashActionsWidth: '15rem',
  dashAgendaWidth: '15.125rem',
  dashBackgroundColor: backgroundColor,
  dashBorderColor: 'rgba(0, 0, 0, .1)',
  dashGutter: '1rem',
  // Note: property 'dashMinWidth' prevents layout from collapsing in Safari
  //       in a better future we may be more adaptive/responsive (TA)
  dashMinWidth: '79rem',
  dashAlertHeight: '2.625rem',
  dashSectionHeaderLineHeight: '2rem',
  dashSidebarBackgroundColor: appTheme.palette.mid,
  dashSidebarWidth: '15rem',

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
    fontSize: appTheme.typography.s4,
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
    cursor: 'not-allowed'
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
  meetingSidebarWidth: '15rem',

  // Menus
  // ---------------------------------------------------------------------------
  menuBackgroundColor: '#fff' || backgroundColor,
  menuBorderColor: appTheme.palette.mid30l,
  menuGutterHorizontal: '.75rem',
  menuGutterVertical: '.375rem',
  menuItemPaddingHorizontal: '.75rem',
  menuItemPaddingVertical: '.25rem',
  zMenu: zIndexScale(4),

  // Modals
  // ---------------------------------------------------------------------------
  modalBorderRadius: borderRadiusLarge,
  modalBoxShadow: '0 .25rem .5rem 0 rgba(0, 0, 0, .35)',
  modalButtonSize: BUTTON_SIZE_MEDIUM,
  modalLayoutMain: MODAL_LAYOUT_MAIN,
  modalLayoutMainWithDashAlert: MODAL_LAYOUT_MAIN_WITH_DASH_ALERT,
  modalLayoutViewport: MODAL_LAYOUT_VIEWPORT,
  modalLayout: [
    MODAL_LAYOUT_MAIN,
    MODAL_LAYOUT_MAIN_WITH_DASH_ALERT,
    MODAL_LAYOUT_VIEWPORT
  ],

  // Notifications
  // ---------------------------------------------------------------------------
  notificationButtonSize: BUTTON_SIZE_SMALLEST,

  // Panels
  // ---------------------------------------------------------------------------
  panelBorderColor: appTheme.palette.mid40l,
  panelBorderRadius: borderRadiusMedium,
  panelGutter: '1rem',

  // Project columns
  // ---------------------------------------------------------------------------
  projectColumnsMaxWidth: '78.25rem',
  projectColumnsMinWidth: '48rem',

  // Rows
  // ---------------------------------------------------------------------------
  rowBorderColor: appTheme.palette.mid20l,
  rowHeadingColor: appTheme.palette.dark,
  rowHeadingFontSize: appTheme.typography.s4,
  rowGutter: '1rem',

  // Tags
  // ---------------------------------------------------------------------------
  tagGutter: '.75rem',
  tagPalette: [
    'cool',
    'gray',
    'light',
    'warm',
    'white'
  ],

  // Transitions
  // ---------------------------------------------------------------------------
  transitionFastest,
  transitionFaster,
  transitionFast,
  transitionSlow,
  transitionSlower,
  transitionSlowest,

  // Generic zIndex scale
  // ---------------------------------------------------------------------------
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
