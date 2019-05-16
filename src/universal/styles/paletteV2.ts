export namespace PALETTE {
  export const enum PRIMARY {
    MAIN = '#493272',
    LIGHT = '#8869C2',
    DARK = '#3F2B63'
  }
  export const enum BACKGROUND {
    MAIN = '#F1F0FA',
    MAIN_DARKENED = '#E0DDEC', // PRIMARY.MAIN alpha 10% over BACKGROUND.MAIN
    MAIN_LIGHTENED = '#F5F4FB', // BACKGROUND.MAIN alpha .15 over #FFF
    LIGHTEST = '#F1F0FA80',
    BACKDROP = '#4442584D', // rgba(68, 66, 88, 0.3)
    DARK = '#444258E6',
    YELLOW = '#FFCC63',
    BLUE = '#329AE5',
    RED = '#FD6157',
    TEAL = '#55C0CF',
    GREEN = '#61BF8B'
  }

  export const enum BORDER {
    LIGHTER = '#DFDFE5',
    LIGHT = '#C1C0CD',
    DARK = '#b6adc7',
    MAIN = '#493272',
    BLUE = '#329AE5',
    BLUE_LIGHT = '#99CDF2'
  }
  export const enum TEXT {
    MAIN = '#444258',
    LIGHT = '#82809A',
    GREEN = '#61BF8B',
    PINK = '#ED4C86',
    RED = '#FD6157',
    PURPLE = '#493272'
  }
  export const enum ERROR {
    MAIN = '#ED4C56'
  }
  export const enum LINK {
    BLUE = '#329AE5',
    MAIN = '#444258',
    LIGHT = '#82809A'
  }

  export const enum TASK_STATUS {
    DONE = '#7C5FB0',
    STUCK = '#FE7168',
    FUTURE = '#55C0CF',
    ACTIVE = '#61BF8B',
    ARCHIVED = '#A2A1AC',
    PRIVATE = '#FFCC63'
  }

  export const enum SERVICES {
    ATLASSIAN_BLUE = '#0052cc'
  }
}
