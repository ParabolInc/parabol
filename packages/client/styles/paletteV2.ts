export const enum PALETTE {
  BACKGROUND_MAIN = '#F1F0FA', // GRAY_100 ?
  BACKGROUND_PRIMARY = '#493272', // PURPLE_700 aka primary purple?
  BACKGROUND_PRIMARY_10A = '#4932721A', // Primary purple at 10% opacity
  BACKGROUND_PRIMARY_20A = '#49327233', // Primary purple at 20% opacity
  BACKGROUND_MENTION_HOVER = '#F1F0FA80', // Light gray at 50% opacity
  BACKGROUND_USER_MENTION = '#F8DEB49A', // Yellow variant at ~60% opacity
  BACKGROUND_REFLECTION = '#49327214', // Primary purple at 8% opacity
  BACKGROUND_MAIN_DARKENED = '#E0DDEC', // PRIMARY.MAIN alpha 10% over BACKGROUND.MAIN
  BACKGROUND_MAIN_LIGHTENED = '#F5F4FB', // BACKGROUND.MAIN alpha .15 over #FFF
  BACKGROUND_LIGHTEST = '#F1F0FA80', // Light gray at 50% opacity
  BACKGROUND_BACKDROP = '#4442584D', // Dark gray at 30% opacity
  BACKGROUND_REFLECTION_STACK = '#444258CD', // Dark gray at ~80% opacity
  BACKGROUND_FORCED_BACKDROP = '#00000052', // 100% black at 32% opacity
  BACKGROUND_DARK = '#444258', // GRAY_700 ? aka dark gray
  BACKGROUND_ERROR_20A = '#ED4C5633', // current red at 20% opacity
  BACKGROUND_YELLOW = '#FFCC63', // YELLOW_200 ?
  BACKGROUND_BLUE = '#329AE5', // BLUE_500 ?
  BACKGROUND_BLUE_LIGHT = '#62AFEA', // BLUE_400 ? // blue lightened for overflow count, find new variant // '#329AE5BF', // a = 75%
  BACKGROUND_BLUE_MAGENTA = '#F8F7FC', // lighter than light gray for highlighting items in a list, like in menus, maybe the new GRAY_100 and let light gray be GRAY_200
  BACKGROUND_RED = '#ED4C56', // current red will become old red-orange? resolve primary gradient?
  BACKGROUND_PINK = '#ED4C86', // PINK_500 ? formerly ‘rose’ used in primary gradient
  BACKGROUND_ORANGE = '#FD6157', // the current ‘orange’ will be the new ‘red’ ? RED_400 ?
  BACKGROUND_TEAL = '#55C0CF', // TEAL_400 ?
  BACKGROUND_GREEN = '#61BF8B', // GREEN_400 ?
  BACKGROUND_GRAY = '#82809A', // GRAY_500 ? aka mid gray
  BACKGROUND_GRAY_50 = '#82809A80', // Mid gray at 50% opacity
  BACKGROUND_TOGGLE_ACTIVE = '#4932721A', // Primary purple at 10% opacity
  BACKGROUND_NAV_LIGHT_ACTIVE = '#F2F2FB', // Unknown mix, some shade of primary, mid, or light gray over white
  BACKGROUND_NAV_LIGHT_HOVER = '#F8F8FD', // Unknown mix, some shade of primary, mid, or light gray over white

  BORDER_DASH_LIGHT = '#D9D8E1', // Used once, todo: resolve to normalized palette
  BORDER_ILLUSTRATION = '#493272A6', // Primary purple at 65% opacity
  BORDER_LIGHTER = '#DFDFE5', // gray 25% over white
  BORDER_LIGHT = '#C9C2D5', // primary 30% over white // was '#C1C0CD', // gray 50% over white
  BORDER_DROPDOWN = '#82809A80', // Mid gray at 50% opacity
  BORDER_PLACEHOLDER = '#82809AA6', // Mid grat at 65% opacity
  BORDER_GRAY = '#82809A80', // Mid gray at 50% opacity
  BORDER_MAIN = '#493272', // PURPLE_700 aka primary purple?
  BORDER_MAIN_40 = '#B6ADC7', // Primary purple at 40% opacity over white
  BORDER_MAIN_50 = '#A499B9', // Primary purple at 50% opacity over white
  BORDER_MATCH_MEETING_COLUMN = '#E4E1EF', // border color needs to be solid and match the column background
  BORDER_BLUE = '#329AE5', // BLUE_500 ?
  BORDER_BLUE_LIGHT = '#99CDF2', // BLUE_300 ?
  BORDER_DARK = '#444258', // GRAY_700 ? aka dark gray
  BORDER_FIELD_FOCUS = '#6D5B8E',
  BORDER_INVOICE_SECTION = '#DBD6E3',

  CONTROL_MAIN = '#493272', // PURPLE_700 aka primary purple?
  CONTROL_MAIN_BACKGROUND = '#49327261', // Primary purple at 38% opacity
  CONTROL_LIGHT = '#FFFFFF', // white
  CONTROL_LIGHT_BACKGROUND = '#9D9CA8',

  GRADIENT_WARM = 'linear-gradient(to right, #ED4C56 0, #ED4C86 100%)', // red to rose
  GRADIENT_WARM_DARKENED = 'linear-gradient(to right, #EC3E49 0, #EC3E7d 100%)',
  GRADIENT_WARM_LIGHTENED = 'linear-gradient(to right, #EA8288 0, #EA82A7 100%)',

  ERROR_MAIN = '#ED4C56', // current red will become old red-orange? resolve primary gradient?

  LINK_BLUE = '#329AE5', // BLUE_500 ?
  LINK_BLUE_HOVER = '#246FA6', // BLUE_600 ?
  LINK_MAIN = '#444258', // GRAY_700 ? aka dark gray
  LINK_LIGHT = '#82809A', // GRAY_500 ? aka mid gray

  PLACEHOLDER = '#4442589a', // Dark gray at X opacity
  PLACEHOLDER_FOCUS_ACTIVE = '#4442584d', // Dark gray at X opacity

  POKER_QUESTION_CARD = '#E55CA0', // PINK_500 ?
  POKER_PASS_CARD = '#AC72E5', // PURPLE_500 ?

  PRIMARY_MAIN = '#493272', // PURPLE_700 aka primary purple?
  PRIMARY_LIGHT = '#8869C2', // PURPLE_500 ?

  PROMPT_RED = '#E55C5C', // RED_500 ?
  PROMPT_ORANGE = '#E59545', // ORANGE_300 ?
  PROMPT_YELLOW = '#E5E500', // YELLOW_200 ?
  PROMPT_LIGHT_GREEN = '#7EE517', // LIME_200 ?
  PROMPT_GREEN = '#52CC52', // DARK_GREEN_400 ?
  PROMPT_CYAN = '#45E595', // GREEN_400 ?
  PROMPT_LIGHT_BLUE = '#45E5E5', // TEAL_400 ?
  PROMPT_BLUE = '#5CA0E5', // BLUE_500 ?
  PROMPT_PURPLE = '#7373E5', // VIOLET_500 ?
  PROMPT_VIOLET = '#AC73E5', // PURPLE_500 ?
  PROMPT_FUCHSIA = '#E55CA0', // FUCHSIA_500 ?
  PROMPT_PINK = '#E573E5', // PINK_500 ?

  TAG_USER_DRAGGING = '#8869C2', // PURPLE_500 ?

  STATUS_DONE = '#7C5FB0', // PURPLE_600 ?
  STATUS_STUCK = '#FE7168', // Lighter variant of RED_400 ?
  STATUS_FUTURE = '#55C0CF', // TEAL_400 ?
  STATUS_ACTIVE = '#61BF8B', // GREEN_400 ?
  STATUS_ARCHIVED = '#A2A1AC', // GRAY_400 ?
  STATUS_PRIVATE = '#FFCC63', // YELLOW_200 ?

  TEXT_MAIN = '#444258', // GRAY_700 ? aka dark gray
  TEXT_MAIN_DARK = '#3A384B', // mix with 15% black
  TEXT_MAIN_40A = '#44425866', // Dark gray at 40% opacity, used in 2 places as lighter gray, maybe use mid gray GRAY_500 ?
  TEXT_MAIN_HOVER = '#22212C', // GRAY_800 or GRAY_900 ?
  TEXT_GRAY = '#82809A', // GRAY_500 ? aka mid gray
  TEXT_GRAY_DARK = '#6F6D83', // mix with 15% black
  TEXT_LIGHT = '#F1F0FA', // GRAY_100 ?
  TEXT_LIGHT_DARK = '#CDCCD5', // mix with 15% black
  TEXT_GREEN = '#61BF8B', // GREEN_400 ?
  TEXT_ORANGE = '#FD6157', // the current ‘orange’ will be the new ‘red’ ? RED_400 ?
  TEXT_ORANGE_DARK = '#D7524A', // mix with 15% black
  TEXT_RED = '#ED4C56', // current red will become old red-orange? resolve primary gradient?
  TEXT_RED_DARK = '#C94149', // mix with 15% black
  TEXT_PURPLE = '#493272', // PURPLE_700 aka primary purple?
  TEXT_BLUE = '#329AE5', // BLUE_500 ?
  TEXT_BLUE_DARK = '#2B83C3', // mix with 15% black
  TEXT_TOGGLE_ACTIVE = '#332350',
  TEXT_INVOICE_LABEL = '#A2A1AC', // GRAY_400 ?

  EMPHASIS_COOL = '#329AE5', // BLUE_500 ?
  EMPHASIS_COOL_LIGHTER = '#59BAFF',
  EMPHASIS_WARM = '#ED4C86', // PINK_500 ? formerly ‘rose’ used in primary gradient
  WARNING_MAIN = '#E59545' // ORANGE_300 ?
}
