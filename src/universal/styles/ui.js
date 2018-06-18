// -----------------------------------------------------------------------------
// ui.js
// -----------------------------------------------------------------------------

import tinycolor from 'tinycolor2'
import appTheme from 'universal/styles/theme/appTheme'
import makeGradient from 'universal/styles/helpers/makeGradient'
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles'
import zIndexScale from 'universal/styles/helpers/zIndexScale'

// Reusable constants for UI object
// -----------------------------------------------------------------------------

const makeShadowColor = (opacity) => `rgba(68, 66, 88, ${opacity})`

// Breakpoints
const BREAKPOINT_WIDE = '@media (min-width: 90rem)'
const BREAKPOINT_WIDER = '@media (min-width: 100rem)'
const BREAKPOINT_WIDEST = '@media (min-width: 120rem)'

// Control sizes (used by buttons and fields)
const CONTROL_SIZE_SMALL = 'small'
const CONTROL_SIZE_MEDIUM = 'medium'
const CONTROL_SIZE_LARGE = 'large'

const CONTROL_SMALL_FONT_SIZE = '.8125rem'
const CONTROL_SMALL_LINE_HEIGHT = '1.25rem'
const CONTROL_SMALL_PADDING_HORIZONTAL = '.4375rem'
const CONTROL_SMALL_BLOCK_PADDING_HORIZONTAL = '.5rem'
const CONTROL_SMALL_PADDING_VERTICAL = '.3125rem'
const CONTROL_SMALL_BLOCK_PADDING_VERTICAL = '.375rem'

const CONTROL_MEDIUM_FONT_SIZE = '.9375rem'
const CONTROL_MEDIUM_LINE_HEIGHT = '1.5rem'
const CONTROL_MEDIUM_PADDING_HORIZONTAL = '.6875rem'
const CONTROL_MEDIUM_BLOCK_PADDING_HORIZONTAL = '.75rem'
const CONTROL_MEDIUM_PADDING_VERTICAL = '.4375rem'
const CONTROL_MEDIUM_BLOCK_PADDING_VERTICAL = '.5rem'

const CONTROL_LARGE_FONT_SIZE = '1rem'
const CONTROL_LARGE_LINE_HEIGHT = '1.75rem'
const CONTROL_LARGE_PADDING_HORIZONTAL = '.9375rem'
const CONTROL_LARGE_BLOCK_PADDING_HORIZONTAL = '1rem'
const CONTROL_LARGE_PADDING_VERTICAL = '.6875rem'
const CONTROL_LARGE_BLOCK_PADDING_VERTICAL = '.75rem'

// Colors
const {cool, warm, dark, mid, light} = appTheme.palette
const {purple, purpleLightened, midGray} = appTheme.brand.primary
const {blue, red, rose, green, yellow} = appTheme.brand.secondary
const backgroundColor = appTheme.brand.primary.silver

// Border radius ratio: powers of 2
// Small border radius for controls (inputs, buttons, etcs.)
const borderRadiusSmall = '.125rem' // 2px
// Medium border radius for grouped components (cards, panels, etc.)
const borderRadiusMedium = '.25rem' // 4px
// Large border radius for larger components (modals, pages, etc.)
const borderRadiusLarge = '.5rem' // 8px

// Buttons
const BUTTON_SIZE_SMALL = CONTROL_SIZE_SMALL
const BUTTON_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM
const BUTTON_SIZE_LARGE = CONTROL_SIZE_LARGE

// Color (default for text)
const COLOR_TEXT = appTheme.brand.primary.darkGray
const COLOR_TEXT_LIGHT = appTheme.brand.primary.midGray
const COLOR_ERROR = red

// Color palette
const white = '#fff'
const gray = appTheme.palette.light
const PALETTE_OPTIONS = [
  'cool',
  'warm',
  'dark',
  'mid',
  'light',
  'white',
  'gray',
  'midGray',
  'green',
  'red',
  'yellow',
  'blue'
]
const PALETTE_VALUES = {
  cool,
  warm,
  dark,
  mid,
  light,
  white,
  gray,
  midGray,
  green,
  red,
  yellow,
  blue
}

// Fields
const FIELD_BOX_SHADOW = 'inset 0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)'
const FIELD_BOX_SHADOW_FOCUS = '0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)'
const FIELD_PADDING_HORIZONTAL = '.75rem'
const FIELD_PLACEHOLDER_COLOR = appTheme.palette.dark60a
const FIELD_PLACEHOLDER_COLOR_FOCUS_ACTIVE = appTheme.palette.dark30a
const FIELD_SIZE_SMALL = CONTROL_SIZE_SMALL
const FIELD_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM
const FIELD_SIZE_LARGE = CONTROL_SIZE_LARGE

// Default Menu Dimensions
export const DEFAULT_MENU_HEIGHT = '5rem'
export const DEFAULT_MENU_WIDTH = '10rem'

// Wait time. 25% under Doherty Threshold. Because millennials.
// The goal is to respond to input, but avoid responding with a spinner because that increases perceived wait time
export const HUMAN_ADDICTION_THRESH = 300
export const MAX_WAIT_TIME = 5000
// Filter
const filterBlur = 'blur(1.5px)'

// Theme Gradients TODO: theme-able?
const gradientPurple = makeGradient(purpleLightened, purple)
const gradientWarm = makeGradient(red, rose)
const gradientWarmDarkened = makeGradient(tinycolor(red).darken(3), tinycolor(rose).darken(3))
const gradientWarmLightened = makeGradient(
  tinycolor(red)
    .desaturate()
    .lighten(),
  tinycolor(rose)
    .desaturate()
    .lighten()
)

// Icons
const iconSize = '14px' // FontAwesome base
const iconSizeAvatar = '21px' // FontAwesome 1.5x
const iconSize2x = '28px' // FontAwesome 2x
const iconSize3x = '42px' // FontAwesome 3x
const iconExternalLink = 'external-link-square'

// Modals
const MODAL_LAYOUT_MAIN = 'main'
const MODAL_LAYOUT_MAIN_WITH_DASH_ALERT = 'mainHasDashAlert'
const MODAL_LAYOUT_MAIN_WITH_DASH_ALERTS = 'mainHasDashAlerts'
const MODAL_LAYOUT_VIEWPORT = 'viewport'

// Panels
const panelInnerBorderColor = appTheme.palette.mid10l

// Transitions
// NOTE: increases on a scale of 2x
const transition = [
  '100ms ease-in',
  '200ms ease-in',
  '400ms ease-in',
  '800ms ease-in',
  '1600ms ease-in',
  '3200ms ease-in'
]

// Type
const TYPE_REGULAR = 400
const TYPE_SEMIBOLD = 600

// Shadows
// NOTE: levels increase on a scale of 2x

const baseShadowColor = [
  makeShadowColor('.15'),
  makeShadowColor('.17'),
  makeShadowColor('.19'),
  makeShadowColor('.21'),
  makeShadowColor('.23')
]

const shadow = [
  `0 .0625rem .25rem ${baseShadowColor[0]}, 0 0 .0625rem ${baseShadowColor[0]}`,
  `0 .125rem .5rem ${baseShadowColor[1]}, 0 0 .0625rem ${baseShadowColor[1]}`,
  `0 .25rem 1rem ${baseShadowColor[2]}, 0 0 .0625rem ${baseShadowColor[2]}`,
  `0 .5rem 2rem ${baseShadowColor[3]}, 0 0 .0625rem ${baseShadowColor[3]}`,
  `0 1rem 4rem ${baseShadowColor[4]}, 0 0 .0625rem ${baseShadowColor[4]}`
]

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

  // Private tasks
  // ---------------------------------------------------------------------------
  privateCardBgColor: appTheme.palette.light50l,

  // Avatars
  // ---------------------------------------------------------------------------
  avatarDefaultSize: '2.75rem',

  // Breakpoints
  // ---------------------------------------------------------------------------
  breakpoint: {
    wide: BREAKPOINT_WIDE,
    wider: BREAKPOINT_WIDER,
    widest: BREAKPOINT_WIDEST
  },

  // Buttons
  // ---------------------------------------------------------------------------
  // buttonBaseStyles: {
  //   appearance: 'none',
  //   border: '.0625rem solid transparent',
  //   borderRadius: '5em',
  //   boxShadow: 'none',
  //   color: dark,
  //   cursor: 'pointer',
  //   display: 'inline-block',
  //   fontFamily: appTheme.typography.sansSerif,
  //   fontWeight: 600,
  //   outline: 0,
  //   textAlign: 'center',
  //   userSelect: 'none',
  //   verticalAlign: 'middle',
  //   ':hover,:focus,:active': {
  //     boxShadow: shadow[1]
  //   }
  // },
  buttonBorderRadius: '5em',
  buttonLightThemes: ['white', 'light', 'gray'],
  buttonStylesPrimary: {
    backgroundImage: gradientWarm,
    color: white,
    ':hover,:focus,:active': {
      backgroundImage: gradientWarmDarkened
    },
    ':disabled': {
      backgroundImage: gradientWarmLightened,
      opacity: 1
    }
  },
  buttonBlockStyles: {
    display: 'block',
    paddingLeft: '.5em',
    paddingRight: '.5em',
    width: '100%'
  },
  buttonDisabledStyles: {
    cursor: 'not-allowed',
    opacity: '.5',
    ':hover,:focus': {
      boxShadow: 'none',
      opacity: '.5'
    },
    ':active': {
      animation: 'none',
      boxShadow: 'none'
    },
    ':disabled': {
      boxShadow: 'none'
    }
  },
  buttonPressedDown: {
    transform: 'translate(0, .125rem)'
  },
  buttonSizeOptions: [BUTTON_SIZE_SMALL, BUTTON_SIZE_MEDIUM, BUTTON_SIZE_LARGE],
  buttonSizeStyles: {
    [BUTTON_SIZE_SMALL]: {
      fontSize: CONTROL_SMALL_FONT_SIZE,
      lineHeight: CONTROL_SMALL_LINE_HEIGHT,
      padding: `${CONTROL_SMALL_PADDING_VERTICAL} 1.5em`
    },
    [BUTTON_SIZE_MEDIUM]: {
      fontSize: CONTROL_MEDIUM_FONT_SIZE,
      lineHeight: CONTROL_MEDIUM_LINE_HEIGHT,
      padding: `${CONTROL_MEDIUM_PADDING_VERTICAL} 1.5em`
    },
    [BUTTON_SIZE_LARGE]: {
      fontSize: CONTROL_LARGE_FONT_SIZE,
      lineHeight: CONTROL_LARGE_LINE_HEIGHT,
      padding: `${CONTROL_LARGE_PADDING_VERTICAL} 1.5em`
    }
  },
  buttonTransition: transition[0],

  // Cards
  // ---------------------------------------------------------------------------
  cardBorderColor: appTheme.palette.mid30l,
  cardBorderRadius: borderRadiusMedium,
  cardBoxShadow: shadow[0],
  cardButtonHeight: '1.5rem',
  cardContentFontSize: '.9375rem',
  cardContentLineHeight: '1.375rem',
  cardEditingStatusFontSize: '.6875rem',
  cardEditingStatusLineHeight: appTheme.typography.sBase,
  cardMaxWidth: '17.5rem',
  cardMinHeight: '7.9375rem',
  cardPaddingBase: '.9375rem',
  cardDragStyle: {
    boxShadow: shadow[3]
  },
  cardStatusIndicatorHeight: '.25rem',
  cardStatusIndicatorWidth: '1.875rem',
  cardThemeLabelFontSize: appTheme.typography.s3,
  cardThemeLabelLineHeight: appTheme.typography.s5,

  // Card Controls (tapping these makes cards)
  // ---------------------------------------------------------------------------
  cardControlBackgroundColor: appTheme.palette.mid10a,
  cardControlTransition: 'background-color 100ms ease-in, box-shadow 100ms ease-in',

  // CTA Panels
  // ---------------------------------------------------------------------------
  ctaPanelButtonSize: BUTTON_SIZE_LARGE,

  // Color (default for text)
  // ---------------------------------------------------------------------------
  colorError: COLOR_ERROR,
  colorText: COLOR_TEXT,

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
  dashAgendaWidth: '15rem',
  dashBackgroundColor: backgroundColor,
  dashBorderColor: appTheme.palette.light90d,
  dashBreakpoint: BREAKPOINT_WIDER,
  dashGutterSmall: '1.25rem',
  dashGutterLarge: '2rem',
  dashHeaderMinHeight: '4rem',
  dashHeaderTitleStyles: {
    color: COLOR_TEXT,
    fontFamily: appTheme.typography.serif,
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: '1.5'
  },
  dashMenuBorder: '.0625rem solid #5A4580', // variant of primary purple TODO: theme-able?
  dashMenuHeight: '13.5625rem',
  dashMenuWidth: '10rem',

  // Note: property 'dashMinWidth' prevents layout from collapsing in Safari
  //       in a better future we may be more adaptive/responsive (TA)

  dashMinWidth: '79rem',
  dashAlertHeight: '2.625rem',
  dashAlertsHeight: '5.25rem',

  dashControlFontColor: COLOR_TEXT_LIGHT,
  dashControlFontSize: appTheme.typography.s2,
  dashControlHeight: '1.25rem',

  dashSidebarBackgroundColor: appTheme.palette.mid,
  dashSidebarWidth: '15rem',
  dashTeamBreakpointUp: '@media (min-width: 123.25rem)',
  draftModalMargin: 32,

  // Dates
  // ---------------------------------------------------------------------------
  dueDateBg: light,
  dueDateColor: '#65637A',
  dueDatePastBg: '#FFE2E2',
  dueDatePastColor: red,
  dueDateSoonBg: '#FFF0D1',
  dueDateSoonColor: '#F28934',

  // Email
  // ---------------------------------------------------------------------------
  emailBackgroundColor: backgroundColor,
  emailBodyColor: '#FFFFFF',
  emailFontFamily:
    '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
  emailRuleColor: appTheme.palette.mid20l, // email rule color
  emailRuleHeight: '1px', // email rule height
  emailRuleStyle: {
    backgroundColor: appTheme.palette.mid20l, // email rule color
    border: 0,
    height: '1px', // email rule height
    margin: '0 auto'
  },
  emailTableBase: {
    borderCollapse: 'collapse',
    borderSpacing: '0px',
    margin: '0px auto'
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
    // gray: input and textarea default style
    gray: {
      backgroundColor: appTheme.palette.light,
      borderColor: appTheme.palette.mid40l,
      color: appTheme.palette.dark80d,
      focusBorderColor: appTheme.palette.mid80l,
      placeholder: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR),
      placeholderColorFocusActive: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR_FOCUS_ACTIVE),
      selection: appTheme.palette.mid20l
    },
    // primary: used by agenda topic input
    primary: {
      backgroundColor: '#fff',
      borderColor: 'transparent',
      color: COLOR_TEXT,
      focusBorderColor: appTheme.palette.warm70l,
      placeholder: makePlaceholderStyles(appTheme.palette.warm),
      placeholderColorFocusActive: makePlaceholderStyles(appTheme.palette.warm50l),
      selection: appTheme.palette.warm20l
    },
    // white: used for dropdowns
    white: {
      backgroundColor: '#fff',
      borderColor: appTheme.palette.mid40l,
      color: appTheme.palette.dark,
      focusBorderColor: appTheme.palette.mid80l,
      placeholder: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR),
      placeholderColorFocusActive: makePlaceholderStyles(FIELD_PLACEHOLDER_COLOR_FOCUS_ACTIVE),
      selection: appTheme.palette.mid20l
    }
  },
  fieldDisabled: {
    cursor: 'not-allowed',
    opacity: '.5'
  },
  fieldSizeOptions: [FIELD_SIZE_SMALL, FIELD_SIZE_MEDIUM, FIELD_SIZE_LARGE],
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

  // Gradients
  // ---------------------------------------------------------------------------
  gradientPurple,
  gradientWarm,
  gradientWarmDarkened,
  gradientWarmLightened,

  // Hints
  // ---------------------------------------------------------------------------
  hintColor: COLOR_TEXT_LIGHT,
  hintFontSize: appTheme.typography.s2,
  hintFontSizeLarger: appTheme.typography.s3,

  // Icons
  // ---------------------------------------------------------------------------
  iconSize,
  iconSizeAvatar,
  iconSize2x,
  iconSize3x,
  iconExternalLink,

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

  // Label Headings
  // ---------------------------------------------------------------------------
  labelHeadingColor: midGray,
  labelHeadingFontSize: '.75rem',
  labelHeadingFontWeight: TYPE_SEMIBOLD,
  labelHeadingLineHeight: '1rem',
  labelHeadingLetterSpacing: '.03em',

  // Link
  // ---------------------------------------------------------------------------
  linkColor: COLOR_TEXT,
  linkColorHover: appTheme.palette.mid,

  // Meeting
  // ---------------------------------------------------------------------------
  meetingChromeBoxShadow: `.0625rem 0 .0625rem ${makeShadowColor('.1')}`,
  meetingChromeBoxShadowInset: `inset .0625rem 0 .0625rem ${makeShadowColor('.1')}`,
  meetingBorderColor: appTheme.palette.mid10a,
  meetingCopyFontSize: '.9375rem',
  meetingSidebarGutter: '.5rem',
  meetingSidebarGutterInner: '3.75rem',
  meetingSidebarWidth: '15rem',
  meetingSplashGutter: '4.5rem',
  meetingControlBarHeight: '4rem',
  meetingTopicPhaseMaxWidth: '80rem',
  meetingMinWidth: '80rem',

  // Menus
  // ---------------------------------------------------------------------------
  menuBackgroundColor: '#fff',
  menuBorderColor: appTheme.palette.mid30l,
  menuBorderRadius: borderRadiusSmall,
  menuBoxShadow: shadow[3],
  menuGutterHorizontal: '1rem',
  menuGutterInner: '.75rem',
  menuGutterVertical: '.5rem',
  menuItemBackgroundColorHover: appTheme.palette.light50a,
  menuItemBackgroundColorActive: appTheme.palette.light,
  menuItemColor: appTheme.palette.dark,
  menuItemColorHoverActive: appTheme.palette.dark50d,
  menuItemFontSize: '.9375rem',
  menuItemHeight: '2rem',
  menuItemIconColor: midGray,

  // Modals
  // ---------------------------------------------------------------------------
  modalBackdropBackgroundColor: makeShadowColor('.3'),
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

  // Nav
  // ---------------------------------------------------------------------------

  navMenuDarkBackgroundColorActive: appTheme.palette.mid80d,
  navMenuDarkBackgroundColorHover: appTheme.palette.mid90d,
  navMenuLightBackgroundColorActive: appTheme.palette.light90l,
  navMenuLightBackgroundColorHover: appTheme.palette.light50l,
  navMenuFontSize: '.9375rem',
  navMenuLineHeight: '1.25rem',
  navMenuLeftBorderWidth: '.1875rem',

  // Nav Topics (team agenda, retro discuss)
  // ---------------------------------------------------------------------------

  navTopicFontSize: appTheme.typography.s3,
  navTopicLineHeight: '1.5rem',

  // Notifications
  // ---------------------------------------------------------------------------
  notificationButtonSize: BUTTON_SIZE_SMALL,

  // Panels
  // ---------------------------------------------------------------------------
  panelBoxShadow: shadow[0], // based on dark palette color
  panelInnerBorderColor,
  panelBorderRadius: borderRadiusMedium,
  panelGutter: '1rem',
  panelCompactGutter: '.75rem',
  panelMarginVertical: '1.5rem',

  // Placeholders
  // ---------------------------------------------------------------------------
  placeholderColor: FIELD_PLACEHOLDER_COLOR,
  placeholderColorFocusActive: FIELD_PLACEHOLDER_COLOR_FOCUS_ACTIVE,

  // Task columns
  // ---------------------------------------------------------------------------
  taskColumnPaddingInnerSmall: '.625rem',
  taskColumnPaddingInnerLarge: '.9375rem',
  taskColumnsMaxWidth: '78.25rem',
  taskColumnsMinWidth: '48rem',

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
  rowCompactGutter: '.75rem',
  rowHeading: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem'
  },
  rowSubheading: {
    color: COLOR_TEXT,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4
  },

  // Settings
  // ---------------------------------------------------------------------------
  settingsGutter: '1rem',
  settingsPanelMaxWidth: '48rem',
  settingsPanelMaxWidthNarrow: '40.25rem',

  // Shadows
  shadow,
  scrollableBackgroundColor: appTheme.palette.mid10a,
  scrollableBottomShadow: `0 -.125rem .5rem ${makeShadowColor('.4')}`,
  scrollableTopShadow: `0 .125rem .5rem ${makeShadowColor('.4')}`,

  // Tags
  // ---------------------------------------------------------------------------
  tagFontSize: '.6875rem',
  tagFontWeight: 600,
  tagGutter: '.75rem',
  tagHeight: '1rem',
  tagPadding: '0 .5rem',
  tagPalette: ['cool', 'gray', 'midGray', 'light', 'warm', 'yellow', 'blue', 'white'],

  // Tooltips
  // ---------------------------------------------------------------------------
  tooltipBorderRadius: borderRadiusSmall,
  tooltipBoxShadow: shadow[2],

  // Transitions
  // ---------------------------------------------------------------------------
  transition,

  // Typography
  // ---------------------------------------------------------------------------
  typeRegular: TYPE_REGULAR,
  typeSemiBold: TYPE_SEMIBOLD,

  // Upgrade
  // ---------------------------------------------------------------------------
  upgradeColor: blue,
  upgradeColorOption: 'blue',

  // Voting
  // ---------------------------------------------------------------------------
  votingCheckmarksWidth: '3.375rem',

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
  ziTooltip: zIndexScale(4),

  // Retro cards
  // ---------------------------------------------------------------------------
  retroCardCollapsedHeightRem: '3', // height, in rem, of reflection cards with truncated height
  retroCardMinHeight: '3rem',
  retroCardWidth: '20rem' // width for reflection cards and reflection groups
}

export default ui
