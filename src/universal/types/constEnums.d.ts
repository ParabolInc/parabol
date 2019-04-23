export const enum Times {
  HUMAN_ADDICTION_THRESH = 300,
  MAX_WAIT_TIME = 5000
}

export const enum LoaderSize {
  MAIN = 40,
  WHOLE_PAGE = 400,
  PANEL = 200
}

export const enum ZIndex {
  MODAL = 400 /*should be 24, https://github.com/ParabolInc/action/issues/2772 */
}
// equal to utils/constants
export const enum MeetingTypes {
  ACTION = 'action',
  RETROSPECTIVE = 'retrospective'
}

export const enum Providers {
  ATLASSIAN_NAME = 'Atlassian',
  ATLASSIAN_DESC = 'Create Jira issues from Parabol',
  GITHUB_NAME = 'GitHub',
  GITHUB_DESC = 'Create issues from Parabol',
  SLACK_NAME = 'Slack',
  SLACK_DESC = 'Push meeting notifications'
}

// https://material.io/design/layout/spacing-methods.html
// NOTE: iterate on this pattern as we go (TA)
export const enum Layout {
  TYPE_GRID = 4, // .5x
  LAYOUT_GRID = 8, // 1x
  ROW_GUTTER = 16 // 2x
}
