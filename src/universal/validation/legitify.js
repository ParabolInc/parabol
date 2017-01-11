class Legitity {
  constructor(value) {
    this.value = value;
    this.error = undefined;
  }

  boolean(msg) {
    if (!this.error && this.value !== undefined && this.value !== true && this.value !== false) {
      this.error = msg || 'boolean';
    }
    return this;
  }

  float(msg) {
    if (!this.error && this.value && !Number.isFinite(this.value)) {
      this.error = msg || 'float';
    }
    return this;
  }

  int(msg) {
    if (!this.error && this.value !== parseInt(this.value, 10)) {
      this.error = msg || 'int';
    }
    return this;
  }

  matches(regex, msg) {
    if (!this.error && this.value && !regex.test(this.value)) {
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
  if (Array.isArray(expected)) {
    const schema = legitify(expected[0]);
    const data = [];
    const errors = [];
    let hasErrors = false;
    for (let i = 0; i < actual.length; i++) {
      const actualValue = actual[i];
      const res = schema(actualValue);
      data[i] = res.data;
      // maybe we have to send in empties too
      if (Object.keys(res.errors).length > 0) {
        errors[i] = res.errors;
        hasErrors = true;
      }
    }
    return {errors: hasErrors && errors, data};
  }
  const data = {};
  const errors = {};
  if (typeof actual === 'object') {
    const expectedKeys = Object.keys(expected);
    for (let i = 0; i < expectedKeys.length; i++) {
      const key = expectedKeys[i];
      const maybeValidator = expected[key];
      const actualValue = actual[key];
      if (typeof maybeValidator === 'function') {
        const monadicVal = new Legitity(actualValue);
        const {error, value} = maybeValidator(monadicVal);
        if (Object.prototype.hasOwnProperty.call(actual, key)) {
          data[key] = value;
        }
        if (error) {
          errors[key] = error;
        }
      } else if (actualValue) {
        const schema = legitify(maybeValidator);
        const res = schema(actualValue);
        data[key] = res.data;
        if (Object.keys(res.errors).length > 0) {
          errors[key] = res.errors;
        }
      }
    }
  }
  return {errors, data};
};

export default legitify;
