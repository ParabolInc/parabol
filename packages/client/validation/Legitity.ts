class Legitity {
  value: any
  error: undefined | string

  constructor(value: string) {
    this.value = value
    this.error = undefined
  }

  boolean(msg?: string) {
    if (!this.error && this.value !== undefined && this.value !== true && this.value !== false) {
      this.error = msg || 'boolean'
    }
    return this
  }

  float(msg?: string) {
    if (!this.error && this.value !== undefined && !Number.isFinite(this.value)) {
      this.error = msg || 'float'
    }
    return this
  }

  int(msg?: string) {
    if (!this.error && this.value !== parseInt(this.value, 10)) {
      this.error = msg || 'int'
    }
    return this
  }

  matches(regex: RegExp, msg?: string) {
    if (!this.error && this.value && !regex.test(this.value)) {
      this.error = msg || 'regex'
    }
    return this
  }

  max(len: number, msg?: string) {
    // this.value.length gives us the count of UTF-16 units, so 🔥 has a length of 2
    // Spreading the string into an array gives us the desired length in codepoints (characters): https://stackoverflow.com/a/54369605
    const value = [...this.value]
    if (!this.error && value.length >= len) {
      this.error = msg || 'max'
    }
    return this
  }

  min(len: number, msg?: string) {
    // this.value.length gives us the count of UTF-16 units, so 🔥 has a length of 2
    // Spreading the string into an array gives us the desired length in codepoints (characters): https://stackoverflow.com/a/54369605
    const value = [...this.value]
    if (!this.error && value.length < len) {
      this.error = msg || 'min'
    }
    return this
  }

  required(msg?: string) {
    if (!this.error && !this.value) {
      this.error = msg || 'required'
    }
    return this
  }

  trim() {
    this.value = this.value && this.value.trim ? this.value.trim() : this.value
    return this
  }

  normalize(fn: (value: any) => string | null | undefined, msg: string) {
    if (!this.error) {
      this.value = this.value !== undefined && fn(this.value)
      if (this.value === null) {
        this.error = msg
      }
    }
    return this
  }

  test(check: (value: any) => string | undefined) {
    if (!this.error) {
      this.error = check(this.value)
    }
    return this
  }
}

export default Legitity
