class Legitity {
  constructor(value) {
    this.value = value;
    this.error = undefined;
  }
  matches(regex, msg) {
    if (!this.error && !regex.test(this.value)) {
      this.error = msg || 'regex';
    }
    return this;
  }

  max(len, msg) {
    if (!this.error && this.value && this.value.length > len) {
      this.error = msg || 'max';
    }
    return this;
  }

  min(len, msg) {
    if (!this.error && this.value && this.value.length < len) {
      this.error = msg || 'min';
    }
    return this;
  }

  required(msg) {
    if (!this.error && !this.value) {
      this.error = msg || 'required';
    }
    return this;
  }

  trim() {
    this.value = this.value && this.value.trim();
    return this;
  }

  test(check) {
    if (!this.error) {
      this.error = check(this.value);
    }
    return this;
  }
}

const legitify = (expected) => (actual) => {
  const data = {};
  const errors = {};
  const expectedKeys = Object.keys(expected);
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    const maybeValidator = expected[key];
    if (Array.isArray(maybeValidator)) {
      const actualValue = actual[key] || [];
      for (let j = 0; j < actualValue.length; j++) {
        const schema = legitify(maybeValidator[0]);
        const res = schema(actualValue[j]);
        data[key] = data[key] || [];
        data[key][j] = res.data;
        if (res.errors && Object.keys(res.errors).length > 0) {
          errors[key] = errors[key] || [];
          errors[key][j] = res.errors;
        }
      }
    } else if (typeof maybeValidator === 'object') {
      const schema = legitify(maybeValidator);
      const res = schema(actual[key]);
      data[key] = res.data;
      if (res.errors) {
        errors[key] = res.errors;
      }
    } else {
      const monadicVal = new Legitity(actual[key]);
      const {error, value} = maybeValidator(monadicVal);
      if (actual.hasOwnProperty(key)) {
        data[key] = value;
      }
      if (error) {
        errors[key] = error;
      }
    }
  }
  return {errors, data};
};

export default legitify;
