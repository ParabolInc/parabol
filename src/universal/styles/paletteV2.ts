export namespace PALETTE {
  export const enum PRIMARY {
    MAIN = '#493272',
    LIGHT = '#8869C2',
    DARK = '#3F2B63'
  }
  export const enum BACKGROUND {
    MAIN = '#F1F0FA',
    MAIN_DARKENED = '#E0DFEC', // TEXT.LIGHT alpha .15 over BACKGROUND.MAIN
    MAIN_LIGHTENED = '#F5F4FB', // BACKGROUND.MAIN alpha .15 over #FFF
    LIGHTEST = '#F1F0FA80',
    YELLOW = '#FFCC63',
    BLUE = '#329AE5',
    RED = '#FD6157',
    TEAL = '#55C0CF',
    GREEN = '#61BF8B'
  }

  export const enum BORDER {
    // LIGHT = '#D1CBDB',
    LIGHT = '#C1C0CD',
    DARK = '#b6adc7',
    MAIN = '#493272',
    BLUE_RGB = '50, 154, 229'
  }
  export const enum TEXT {
    MAIN = '#444258',
    LIGHT = '#82809A',
    GREEN = '#61BF8B'
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
