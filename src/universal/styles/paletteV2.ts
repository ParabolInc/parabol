export namespace PALETTE {
  export const enum PRIMARY {
    MAIN = '#493272',
    LIGHT = '#8869C2',
    DARK = '#3F2B63'
  }
  export const enum BACKGROUND {
    MAIN = '#F1F0FA',
    MAIN_DARKENED = '#E0DFEC', // TEXT.LIGHT alpha .15 over BACKGROUND.MAIN
    MAIN_LIGHTENED = '#F5F4FB' // BACKGROUND.MAIN alpha .15 over #FFF
  }
  export const enum BORDER {
    LIGHT = '#DBD6E3',
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
