export const ResponseCardDimensions = {
  MIN_CARD_HEIGHT: 100,
  GAP: 32,
  PREFERRED_RESPONSE_WIDTH: 360
}

export const ResponsesGridBreakpoints = {
  TWO_RESPONSE_COLUMN:
    ResponseCardDimensions.PREFERRED_RESPONSE_WIDTH * 2 + ResponseCardDimensions.GAP,
  THREE_RESPONSE_COLUMNS:
    ResponseCardDimensions.PREFERRED_RESPONSE_WIDTH * 3 + ResponseCardDimensions.GAP,
  FOUR_RESPONSE_COLUMNS:
    ResponseCardDimensions.PREFERRED_RESPONSE_WIDTH * 4 + ResponseCardDimensions.GAP,
  FIVE_RESPONSE_COLUMNS:
    ResponseCardDimensions.PREFERRED_RESPONSE_WIDTH * 5 + ResponseCardDimensions.GAP
}
