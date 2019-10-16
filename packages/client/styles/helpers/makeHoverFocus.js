export default function makeHoverFocus(styles) {
  return {
    ':hover': {...styles},
    ':focus': {...styles}
  }
}
