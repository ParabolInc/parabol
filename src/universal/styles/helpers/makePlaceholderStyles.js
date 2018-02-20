export default function makePlaceholderStyles(color) {
  return {
    '::placeholder': {color},

    // Chrome/Opera/Safari
    '::-webkit-input-placeholder': {color},

    // IE 10+
    ':-ms-input-placeholder': {color}
  };
}
