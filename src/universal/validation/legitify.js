class Legitity {
  constructor(value) {
    this.value = value;
    this.error = undefined;
  }

  matches(regex, msg) {
    if (!this.error && !regex.test(this.value)) {
      this.error = msg || 'regex'
    }
    return this;
  }

  max(len, msg) {
    if (!this.error && this.value.length > len) {
      this.error = msg || 'max';
    }
    return this;
  }

  min(len, msg) {
    if (!this.error && this.value.length < len) {
      this.error = msg || 'min';
    }
    return this;
  }

  required(msg) {
    if (!this.error && this.value === undefined) {
      this.error = msg || 'required'
    }
    return this;
  }

  trim() {
    this.value = this.value.trim();
    return this;
  }

  true(check, msg) {
    if (!this.error && !check(this.value)) {
      this.error = msg || 'true'
    }
    return this;
  }
}

export default function legitify(actual, expected) {
  const data = {};
  const errors = {};
  const expectedKeys = Object.keys(expected);
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    const monadicVal = new Legitity(actual[key]);
    const validator = expected[key];
    const {error, value} = validator(monadicVal);
    data[key] = value;
    if (error) {
      errors[key] = error;
    }
  }
  return {errors, data};
};
