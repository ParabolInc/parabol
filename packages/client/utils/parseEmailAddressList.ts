import {parseAddressList, parseOneAddress} from 'email-addresses'

const parseEmailAddressList = (rawStr = ''): {parsedInvitees: any; invalidEmailExists: boolean} => {
  // this breaks RFC5322 standards, but people are not standard :-(
  const commaDelimStr = rawStr
    // replace line breaks & semi colons with commas
    .replace(/(?:\r\n|\r|\n|;)/g, ',')
    // if the above created 2 commas (like a , + linebreak), remove dupes
    .replace(/,+/g, ',')
    // remove leading/trailing whitespace
    .trim()
    // remove trailing commas
    .replace(/,$/g, '')

  const emailCount = commaDelimStr.split(',').length
  const lastEmailIndex = commaDelimStr.lastIndexOf(' ' || ',')
  const lastEmail = commaDelimStr.slice(lastEmailIndex, commaDelimStr.length)
  const lastChar = commaDelimStr.charAt(commaDelimStr.length - 1)
  const isAddingNewEmail = lastChar !== ' ' && lastChar !== ',' && !parseOneAddress(lastEmail)

  if (emailCount === 1 && isAddingNewEmail) {
    return {
      parsedInvitees: parseAddressList(commaDelimStr),
      invalidEmailExists: false
    }
  }

  // if adding new email, return everything except the final email, remove leading/trailing
  // whitespace and remove trailing commas
  const filteredStr = isAddingNewEmail
    ? commaDelimStr
        .slice(0, lastEmailIndex)
        .trim()
        .replace(/,$/g, '')
    : commaDelimStr
  const parsedFilteredInvitees = parseAddressList(filteredStr)
  if (parsedFilteredInvitees) {
    return {
      parsedInvitees: parsedFilteredInvitees,
      invalidEmailExists: false
    }
  } else {
    for (let i = filteredStr.length; i >= 0; i--) {
      const slicedStr = filteredStr.slice(0, i)
      const parsedSlicedInvitees = parseAddressList(slicedStr)
      if (parsedSlicedInvitees) {
        return {
          parsedInvitees: parsedSlicedInvitees,
          invalidEmailExists: true
        }
      }
    }
    return {
      parsedInvitees: parsedFilteredInvitees,
      invalidEmailExists: true
    }
  }
}

export default parseEmailAddressList
