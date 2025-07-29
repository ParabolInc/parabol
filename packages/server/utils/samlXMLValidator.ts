import {XMLValidator} from 'fast-xml-parser'

export const samlXMLValidator = {
  async validate(xml: string) {
    const isValid = XMLValidator.validate(xml, {
      allowBooleanAttributes: true
    })
    if (isValid === true) return 'SUCCESS_VALIDATE_XML'
    throw 'ERR_INVALID_XML'
  }
}
