export default function makePlaceholderStyles(color) {
  return {
    // Chrome/Opera/Safari
    '::-webkit-input-placeholder': {color},

    // Firefox 19+
    '::-moz-placeholder': {color},

    // IE 10+
    ':-ms-input-placeholder': {color},

    // Firefox 18-
    ':-moz-placeholder': {color}
  };
}
