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
    YELLOW = '#FFCC63',
    BLUE = '#329AE5',
    RED = '#FD6157',
    TEAL = '#55C0CF',
    GREEN = '#61BF8B'
  }

  export const enum BORDER {
    LIGHT = '#D1CBDB',
    DARK = '#b6adc7',
    MAIN = '#493272'
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
    COLOR_NEUTRAL = '#444258'
  }
}
