// values copied from https://material-components.github.io/material-components-web-catalog/#/component/elevation
// guidelines on how to use here: https://material.io/design/environment/elevation.html#default-elevations

// lighter Parabol theme values (keep TA)
// const rgb = '68, 66, 88' // MD default 0, 0, 0
// const alpha = ['0.18', '0.12', '0.1'] // MD default 0.2, 0.14, 0.12

// going to try to live with MD defaults for a little bit
// which are darker and help some elements like switch thumbs stand out
// const rgb = '0, 0, 0'
// const alpha = ['0.2', '0.14', '0.12']

// prettier-ignore
export const enum Elevation {
  Z0 = 'rgba(0,0,0,.2) 0px 0px 0px 0px, rgba(0,0,0,.14) 0px 0px 0px 0px, rgba(0,0,0,.12) 0px 0px 0px 0px',
  Z1 = 'rgba(0,0,0,.2) 0px 2px 1px -1px, rgba(0,0,0,.14) 0px 1px 1px 0px, rgba(0,0,0,.12) 0px 1px 3px 0px',
  Z2 = 'rgba(0,0,0,.2) 0px 3px 1px -2px, rgba(0,0,0,.14) 0px 2px 2px 0px, rgba(0,0,0,.12) 0px 1px 5px 0px',
  Z3 = 'rgba(0,0,0,.2) 0px 3px 3px -2px, rgba(0,0,0,.14) 0px 3px 4px 0px, rgba(0,0,0,.12) 0px 1px 8px 0px',
  Z4 = 'rgba(0,0,0,.2) 0px 2px 4px -1px, rgba(0,0,0,.14) 0px 4px 5px 0px, rgba(0,0,0,.12) 0px 1px 10px 0px',
  Z5 = 'rgba(0,0,0,.2) 0px 3px 5px -1px, rgba(0,0,0,.14) 0px 5px 8px 0px, rgba(0,0,0,.12) 0px 1px 14px 0px',
  Z6 = 'rgba(0,0,0,.2) 0px 3px 5px -1px, rgba(0,0,0,.14) 0px 6px 10px 0px, rgba(0,0,0,.12) 0px 1px 18px 0px',
  Z7 = 'rgba(0,0,0,.2) 0px 4px 5px -2px, rgba(0,0,0,.14) 0px 7px 10px 1px, rgba(0,0,0,.12) 0px 2px 16px 1px',
  Z8 = 'rgba(0,0,0,.2) 0px 5px 5px -3px, rgba(0,0,0,.14) 0px 8px 10px 1px, rgba(0,0,0,.12) 0px 3px 14px 2px',
  Z9 = 'rgba(0,0,0,.2) 0px 5px 6px -3px, rgba(0,0,0,.14) 0px 9px 12px 1px, rgba(0,0,0,.12) 0px 3px 16px 2px',
  Z10 = 'rgba(0,0,0,.2) 0px 6px 6px -3px, rgba(0,0,0,.14) 0px 10px 14px 1px, rgba(0,0,0,.12) 0px 4px 18px 3px',
  Z11 = 'rgba(0,0,0,.2) 0px 6px 7px -4px, rgba(0,0,0,.14) 0px 11px 15px 1px, rgba(0,0,0,.12) 0px 4px 20px 3px',
  Z12 = 'rgba(0,0,0,.2) 0px 7px 8px -4px, rgba(0,0,0,.14) 0px 12px 17px 2px, rgba(0,0,0,.12) 0px 5px 22px 4px',
  Z13 = 'rgba(0,0,0,.2) 0px 7px 8px -4px, rgba(0,0,0,.14) 0px 13px 19px 2px, rgba(0,0,0,.12) 0px 5px 24px 4px',
  Z14 = 'rgba(0,0,0,.2) 0px 7px 9px -4px, rgba(0,0,0,.14) 0px 14px 21px 2px, rgba(0,0,0,.12) 0px 5px 26px 4px',
  Z15 = 'rgba(0,0,0,.2) 0px 8px 9px -5px, rgba(0,0,0,.14) 0px 15px 22px 2px, rgba(0,0,0,.12) 0px 6px 28px 5px',
  Z16 = 'rgba(0,0,0,.2) 0px 8px 10px -5px, rgba(0,0,0,.14) 0px 16px 24px 2px, rgba(0,0,0,.12) 0px 6px 30px 5px',
  Z17 = 'rgba(0,0,0,.2) 0px 8px 11px -5px, rgba(0,0,0,.14) 0px 17px 26px 2px, rgba(0,0,0,.12) 0px 6px 32px 5px',
  Z18 = 'rgba(0,0,0,.2) 0px 9px 11px -5px, rgba(0,0,0,.14) 0px 18px 28px 2px, rgba(0,0,0,.12) 0px 7px 34px 6px',
  Z29 = 'rgba(0,0,0,.2) 0px 9px 12px -6px, rgba(0,0,0,.14) 0px 19px 29px 2px, rgba(0,0,0,.12) 0px 7px 36px 6px',
  Z20 = 'rgba(0,0,0,.2) 0px 10px 13px -6px, rgba(0,0,0,.14) 0px 20px 31px 3px, rgba(0,0,0,.12) 0px 8px 38px 7px',
  Z21 = 'rgba(0,0,0,.2) 0px 10px 13px -6px, rgba(0,0,0,.14) 0px 21px 33px 3px, rgba(0,0,0,.12) 0px 8px 40px 7px',
  Z22 = 'rgba(0,0,0,.2) 0px 10px 14px -6px, rgba(0,0,0,.14) 0px 22px 35px 3px, rgba(0,0,0,.12) 0px 8px 42px 7px',
  Z23 = 'rgba(0,0,0,.2) 0px 11px 14px -7px, rgba(0,0,0,.14) 0px 23px 36px 3px, rgba(0,0,0,.12) 0px 9px 44px 8px',
  Z24 = 'rgba(0,0,0,.2) 0px 11px 15px -7px, rgba(0,0,0,.14) 0px 24px 38px 3px, rgba(0,0,0,.12) 0px 9px 46px 8px',
  BUTTON_RAISED = 'rgba(0,0,0,.2) 0px 5px 5px -3px, rgba(0,0,0,.14) 0px 8px 10px 1px, rgba(0,0,0,.12) 0px 3px 14px 2px', // Z8
  CARD_DRAGGING = 'rgba(0,0,0,.2) 0px 5px 5px -3px, rgba(0,0,0,.14) 0px 8px 10px 1px, rgba(0,0,0,.12) 0px 3px 14px 2px', // Z8
  SHEET = 'rgba(0,0,0,.2) 0px 8px 10px -5px, rgba(0,0,0,.14) 0px 16px 24px 2px, rgba(0,0,0,.12) 0px 6px 30px 5px', // Z16
  CARD_SHADOW = 'rgba(0,0,0,.2) 0px 2px 1px -1px, rgba(0,0,0,.14) 0px 1px 1px 0px, rgba(0,0,0,.12) 0px 1px 3px 0px', // Z1
  CARD_SHADOW_HOVER = 'rgba(0,0,0,.2) 0px 3px 3px -2px, rgba(0,0,0,.14) 0px 3px 4px 0px, rgba(0,0,0,.12) 0px 1px 8px 0px', // Z3
  DISCUSSION_THREAD = 'rgba(0,0,0,.2) 0px 3px 1px -2px, rgba(0,0,0,.14) 0px 2px 2px 0px, rgba(0,0,0,.12) 0px 1px 5px 0px', // Z2
  DISCUSSION_INPUT = '0px 0px 16px 0px rgba(0,0,0,0.3)' // shadow on the top that lays over the thread
}

// TODO move these into the enum
export const buttonShadow = Elevation.Z2
export const buttonRaisedShadow = Elevation.Z8

export const cardShadow = Elevation.Z1
export const cardHoverShadow = Elevation.Z3
export const cardFocusShadow = Elevation.Z5 // aka editing
export const cardRaisedShadow = Elevation.Z8 // aka dragging

export const fabShadow = Elevation.Z6
export const fabRaisedShadow = Elevation.Z12
export const menuShadow = Elevation.Z8
export const modalShadow = Elevation.Z24
export const bottomBarShadow = Elevation.Z8
export const navItemRaised = Elevation.Z8
export const navDrawerShadow = Elevation.Z16
export const panelShadow = Elevation.Z1
export const panelRaisedShadow = Elevation.Z8
export const searchBarShadow = Elevation.Z1
export const sheetShadow = Elevation.Z16
export const snackbarShadow = Elevation.Z6
// some MD examples show the switch to use elevation 2, others elevation 1
// elevation 2 helps the white off switch thumb stand out more
export const switchShadow = Elevation.Z2
export const textButtonShadow = Elevation.Z0

export const desktopBarShadow = Elevation.Z4
export const desktopSidebarShadow = Elevation.Z4
