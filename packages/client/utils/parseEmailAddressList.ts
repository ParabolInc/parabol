import emailAddresses from 'email-addresses'

const filterLastEmail = (commaDelimStr: string) => {
  const trimmedStr = commaDelimStr.trim()
  const lastEmailIndex = trimmedStr.lastIndexOf(' ' || ',')
  // get everything up to the final email and remove trailing commas
  return trimmedStr.slice(0, lastEmailIndex).replace(/,$/g, '')
}

const parseEmailAddressList = (rawStr = '') => {
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
  const lastChar = rawStr.charAt(rawStr.length - 1)
  const isAddingNewEmail = lastChar !== ' ' && lastChar !== ','

  if (emailCount === 1 && isAddingNewEmail) {
    return {
      parsedInvitees: emailAddresses.parseAddressList(commaDelimStr),
      invalidEmailExists: false
    }
  }
  const filteredStr = isAddingNewEmail ? filterLastEmail(commaDelimStr) : commaDelimStr
  if (emailAddresses.parseAddressList(filteredStr)) {
    return {
      parsedInvitees: emailAddresses.parseAddressList(filteredStr),
      invalidEmailExists: false
    }
  } else {
    for (let i = filteredStr.length; i >= 0; i--) {
      const slicedStr = filteredStr.slice(0, i)
      if (emailAddresses.parseAddressList(slicedStr)) {
        return {
          parsedInvitees: emailAddresses.parseAddressList(slicedStr),
          invalidEmailExists: true
        }
      }
    }
    return {
      parsedInvitees: emailAddresses.parseAddressList(filteredStr),
      invalidEmailExists: true
    }
  }
}

export default parseEmailAddressList
