// deprecated, use types/constEnums or similar
// todo: refactor layout, buttons, fields

// Reusable constants for UI object
// -----------------------------------------------------------------------------

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

// Buttons
const BUTTON_SIZE_SMALL = CONTROL_SIZE_SMALL
const BUTTON_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM
const BUTTON_SIZE_LARGE = CONTROL_SIZE_LARGE

// Fields
const FIELD_PADDING_HORIZONTAL = '.75rem'
const FIELD_SIZE_SMALL = CONTROL_SIZE_SMALL
const FIELD_SIZE_MEDIUM = CONTROL_SIZE_MEDIUM
const FIELD_SIZE_LARGE = CONTROL_SIZE_LARGE

// Default Menu Dimensions
export const DEFAULT_MENU_HEIGHT = '5rem'
export const DEFAULT_MENU_WIDTH = '10rem'

// -----------------------------------------------------------------------------

const ui = {
  // Buttons
  // ---------------------------------------------------------------------------
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

  // Fields
  // ---------------------------------------------------------------------------
  fieldBaseStyles: {
    appearance: 'none',
    border: '1px solid transparent',
    borderRadius: 2,
    display: 'block',
    fontFamily:
      '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 16,
    lineHeight: '1.5em',
    margin: '0',
    outline: 0,
    padding: `.25em ${FIELD_PADDING_HORIZONTAL}`,
    width: '100%'
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
  }
} as const

export default ui
