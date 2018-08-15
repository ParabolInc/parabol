// values copied from https://material-components.github.io/material-components-web-catalog/#/component/elevation
// guidelines on how to use here: https://material.io/design/environment/elevation.html#default-elevations

const rgb = '68, 66, 88' // default 0, 0, 0
const alpha = ['0.18', '0.12', '0.1'] // default 0.2, 0.14, 0.12

// prettier-ignore
const elevation = [
  `rgba(${rgb}, ${alpha[0]}) 0px 0px 0px 0px, rgba(${rgb}, ${alpha[1]}) 0px 0px 0px 0px, rgba(${rgb}, ${alpha[2]}) 0px 0px 0px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 2px 1px -1px, rgba(${rgb}, ${alpha[1]}) 0px 1px 1px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 3px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 3px 1px -2px, rgba(${rgb}, ${alpha[1]}) 0px 2px 2px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 5px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 3px 3px -2px, rgba(${rgb}, ${alpha[1]}) 0px 3px 4px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 8px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 2px 4px -1px, rgba(${rgb}, ${alpha[1]}) 0px 4px 5px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 10px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 3px 5px -1px, rgba(${rgb}, ${alpha[1]}) 0px 5px 8px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 14px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 3px 5px -1px, rgba(${rgb}, ${alpha[1]}) 0px 6px 10px 0px, rgba(${rgb}, ${alpha[2]}) 0px 1px 18px 0px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 4px 5px -2px, rgba(${rgb}, ${alpha[1]}) 0px 7px 10px 1px, rgba(${rgb}, ${alpha[2]}) 0px 2px 16px 1px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 5px 5px -3px, rgba(${rgb}, ${alpha[1]}) 0px 8px 10px 1px, rgba(${rgb}, ${alpha[2]}) 0px 3px 14px 2px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 5px 6px -3px, rgba(${rgb}, ${alpha[1]}) 0px 9px 12px 1px, rgba(${rgb}, ${alpha[2]}) 0px 3px 16px 2px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 6px 6px -3px, rgba(${rgb}, ${alpha[1]}) 0px 10px 14px 1px, rgba(${rgb}, ${alpha[2]}) 0px 4px 18px 3px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 6px 7px -4px, rgba(${rgb}, ${alpha[1]}) 0px 11px 15px 1px, rgba(${rgb}, ${alpha[2]}) 0px 4px 20px 3px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 7px 8px -4px, rgba(${rgb}, ${alpha[1]}) 0px 12px 17px 2px, rgba(${rgb}, ${alpha[2]}) 0px 5px 22px 4px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 7px 8px -4px, rgba(${rgb}, ${alpha[1]}) 0px 13px 19px 2px, rgba(${rgb}, ${alpha[2]}) 0px 5px 24px 4px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 7px 9px -4px, rgba(${rgb}, ${alpha[1]}) 0px 14px 21px 2px, rgba(${rgb}, ${alpha[2]}) 0px 5px 26px 4px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 8px 9px -5px, rgba(${rgb}, ${alpha[1]}) 0px 15px 22px 2px, rgba(${rgb}, ${alpha[2]}) 0px 6px 28px 5px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 8px 10px -5px, rgba(${rgb}, ${alpha[1]}) 0px 16px 24px 2px, rgba(${rgb}, ${alpha[2]}) 0px 6px 30px 5px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 8px 11px -5px, rgba(${rgb}, ${alpha[1]}) 0px 17px 26px 2px, rgba(${rgb}, ${alpha[2]}) 0px 6px 32px 5px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 9px 11px -5px, rgba(${rgb}, ${alpha[1]}) 0px 18px 28px 2px, rgba(${rgb}, ${alpha[2]}) 0px 7px 34px 6px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 9px 12px -6px, rgba(${rgb}, ${alpha[1]}) 0px 19px 29px 2px, rgba(${rgb}, ${alpha[2]}) 0px 7px 36px 6px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 10px 13px -6px, rgba(${rgb}, ${alpha[1]}) 0px 20px 31px 3px, rgba(${rgb}, ${alpha[2]}) 0px 8px 38px 7px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 10px 13px -6px, rgba(${rgb}, ${alpha[1]}) 0px 21px 33px 3px, rgba(${rgb}, ${alpha[2]}) 0px 8px 40px 7px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 10px 14px -6px, rgba(${rgb}, ${alpha[1]}) 0px 22px 35px 3px, rgba(${rgb}, ${alpha[2]}) 0px 8px 42px 7px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 11px 14px -7px, rgba(${rgb}, ${alpha[1]}) 0px 23px 36px 3px, rgba(${rgb}, ${alpha[2]}) 0px 9px 44px 8px`,
  `rgba(${rgb}, ${alpha[0]}) 0px 11px 15px -7px, rgba(${rgb}, ${alpha[1]}) 0px 24px 38px 3px, rgba(${rgb}, ${alpha[2]}) 0px 9px 46px 8px`
]

export const buttonShadow = elevation[2]
export const buttonRaisedShadow = elevation[8]
export const cardShadow = elevation[1]
export const cardRaisedShadow = elevation[8]
export const fabShadow = elevation[6]
export const fabRaisedShadow = elevation[12]
export const menuShadow = elevation[8]
export const modalShadow = elevation[24]
export const navBarShadow = elevation[8]
export const navItemRaised = elevation[8]
export const navDrawerShadow = elevation[16]
export const panelShadow = elevation[1]
export const panelRaisedShadow = elevation[8]
export const searchBarShadow = elevation[1]
export const switchShadow = elevation[1]
export const textButtonShadow = elevation[0]

export default elevation
