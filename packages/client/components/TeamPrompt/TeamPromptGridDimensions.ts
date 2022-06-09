export const ResponseCardDimensions = {
  MIN_CARD_HEIGHT: 100,
  GAP: 32,
  MIN_RESPONSE_WIDTH: 320
}

export const GRID_PADDING_LEFT_RIGHT_PERCENT = 0.1 // 10% of the screen
const GRID_SCREEN_WIDTH_PERCENT = 1 - GRID_PADDING_LEFT_RIGHT_PERCENT * 2 // The % of the screen that's available for the grid

// Each value represents the width of the screen for a given number of columns (including gap between and padding on each side)
export const ResponsesGridBreakpoints = {
  TWO_RESPONSE_COLUMN:
    ((ResponseCardDimensions.MIN_RESPONSE_WIDTH + ResponseCardDimensions.GAP) * 2) /
    GRID_SCREEN_WIDTH_PERCENT,
  THREE_RESPONSE_COLUMNS:
    ((ResponseCardDimensions.MIN_RESPONSE_WIDTH + ResponseCardDimensions.GAP) * 3) /
    GRID_SCREEN_WIDTH_PERCENT,
  FOUR_RESPONSE_COLUMNS:
    ((ResponseCardDimensions.MIN_RESPONSE_WIDTH + ResponseCardDimensions.GAP) * 4) /
    GRID_SCREEN_WIDTH_PERCENT,
  FIVE_RESPONSE_COLUMNS:
    ((ResponseCardDimensions.MIN_RESPONSE_WIDTH + ResponseCardDimensions.GAP) * 5) /
    GRID_SCREEN_WIDTH_PERCENT
}
