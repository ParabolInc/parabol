export default function makePlaceholderStyles(color: string) {
  return {
    // can just use pseudo selector for target
    // https://caniuse.com/#feat=css-placeholder
    '::placeholder': {color},

    // Chrome/Opera/Safari
    '::-webkit-input-placeholder': {color},

    // IE 10+
    ':-ms-input-placeholder': {color}
  }
}

export const makePlaceholderStylesString = (color: string) => `
  ::placeholder {
    color: ${color};
  }

  ::-webkit-input-placeholder {
    color: ${color};
  }

  :-ms-input-placeholder {
    color: ${color};
  }
`
