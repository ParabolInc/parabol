// -----------------------------------------------------------------------------
// ui.js
// -----------------------------------------------------------------------------

import tinycolor from 'tinycolor2'
import appTheme from './theme/appTheme'
import makeGradient from './helpers/makeGradient'
import makePlaceholderStyles from './helpers/makePlaceholderStyles'
import makeShadowColor from './helpers/makeShadowColor'

// Reusable constants for UI object
// -----------------------------------------------------------------------------

// Breakpoints
// #deprecated use breakpoints.js instead of ui.breakpoint object (TA)
const BREAKPOINT_WIDER = '@media (min-width: 100rem)' // Breakpoints.Dashboard

// Control sizes (used by buttons and fields)
const CONTROL_SIZE_SMALL = 'small'
const CONTROL_SIZE_MEDIUM = 'medium'
const CONTROL_SIZE_LARGE = 'large'

const CONTROL_SMALL_FONT_SIZE = '.875rem'
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
const COLOR_TEXT_GRAY = appTheme.brand.primary.midGray
const COLOR_ERROR = red

// Color palette
const white = '#FFFFFF'
const gray = appTheme.palette.light
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
const FIELD_BOX_SHADOW = 'none' // 'inset 0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)'
const FIELD_BOX_SHADOW_FOCUS = 'none' // '0 .0625rem .0625rem 0 rgba(0, 0, 0, .1)'
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
const gradientWarm = makeGradient(red, rose)
// linear-gradient(to right,#ED4C56 0,#ED4C86 100%)

// Icons
const iconSize = '14px' // FontAwesome base
const iconExternalLink = 'open_in_new'

// Type
const TYPE_SEMIBOLD = 600

// -----------------------------------------------------------------------------

const ui = {
  // Base settings
  // ---------------------------------------------------------------------------
  backgroundColor,
  borderRadiusSmall,
  borderRadiusLarge,
  palette: PALETTE_VALUES,
  filterBlur,

  // Buttons
  // ---------------------------------------------------------------------------
  buttonBorderRadius: '5em',
  buttonLightThemes: ['white', 'light', 'gray'],
  buttonBlockStyles: {
    display: 'block',
    paddingLeft: '.5em',
    paddingRight: '.5em',
    width: '100%'
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

  // Cards
  // ---------------------------------------------------------------------------
  // #deprecated move these values to cards.js as needed,
  // but make sure they are consistent when temporarily duped (TA)
  cardBorderColor: appTheme.palette.mid30l, // PALETTE.BORDER_MAIN
  cardBorderRadius: borderRadiusMedium,
  cardButtonHeight: '24px',
  cardContentFontSize: '14px',
  cardContentLineHeight: '20px',
  cardPaddingBase: '16px',

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

  dashSidebarBackgroundColor: appTheme.palette.mid,
  // TODO replace with DIMS.DASH_SIDEBAR_WIDTH
  dashSidebarWidth: '15rem',
  draftModalMargin: 32,

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
      backgroundColor: '#FFFFFF',
      borderColor: 'transparent',
      color: COLOR_TEXT,
      focusBorderColor: appTheme.palette.warm70l,
      placeholder: makePlaceholderStyles(appTheme.palette.warm),
      placeholderColorFocusActive: makePlaceholderStyles(appTheme.palette.warm50l),
      selection: appTheme.palette.warm20l
    },
    // white: used for dropdowns
    white: {
      backgroundColor: '#FFFFFF',
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
  fieldLabelGutter: '.5rem',
  fieldErrorPlaceholderColor: appTheme.palette.warm90a,

  // Gradients
  // ---------------------------------------------------------------------------
  gradientWarm,

  // Icons
  // ---------------------------------------------------------------------------
  iconSize,
  iconExternalLink,

  // Label Headings
  // ---------------------------------------------------------------------------
  labelHeadingColor: midGray,
  labelHeadingFontSize: '12px',
  labelHeadingFontWeight: TYPE_SEMIBOLD,
  labelHeadingLineHeight: '16px',
  labelHeadingLetterSpacing: '.03em',

  // Link
  // ---------------------------------------------------------------------------
  linkColor: COLOR_TEXT,
  linkColorHover: appTheme.palette.mid,

  // Menus
  // ---------------------------------------------------------------------------
  menuBorderRadius: borderRadiusSmall,
  menuGutterVertical: '.5rem',
  menuItemBackgroundColorActive: appTheme.palette.light,

  // Modals
  // ---------------------------------------------------------------------------
  modalBackdropBackgroundColor: makeShadowColor('.3'),
  modalBorderRadius: borderRadiusLarge,

  // Nav Topics (team agenda, retro discuss)
  // ---------------------------------------------------------------------------

  navTopicLineHeight: '1.5rem',

  // Placeholders
  // ---------------------------------------------------------------------------
  placeholderColor: FIELD_PLACEHOLDER_COLOR,
  placeholderColorFocusActive: FIELD_PLACEHOLDER_COLOR_FOCUS_ACTIVE,

  // Task columns
  // ---------------------------------------------------------------------------
  taskColumnPaddingInnerSmall: '10px',
  taskColumnPaddingInnerLarge: '15px',
  taskColumnsMaxWidth: '1334px', // (4 x 296 card max-width) + (5 x 30 - gutters around cols)

  // Settings
  // ---------------------------------------------------------------------------
  settingsPanelMaxWidth: '48rem',
  settingsPanelMaxWidthNarrow: '40.25rem',

  // Shadows
  scrollableBackgroundColor: appTheme.palette.mid10a,
  scrollableBottomShadow: `0 -.125rem .5rem ${makeShadowColor('.4')}`,
  scrollableTopShadow: `0 .125rem .5rem ${makeShadowColor('.4')}`
}

export default ui
