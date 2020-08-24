import emailAddresses from 'email-addresses'

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

  const commaDelimArr = commaDelimStr.split(',')

  // check if each address is valid as parseAddressList
  // returns null if one is not
  const validAddresses = [] as string[]
  commaDelimArr.forEach((address) => {
    const trimmedAddress = address.trim()
    if (emailAddresses.parseOneAddress(trimmedAddress)) {
      validAddresses.push(trimmedAddress)
    }
  })

  const validCommaDelimStr = validAddresses.join(',')
  return emailAddresses.parseAddressList(validCommaDelimStr)
}

export default parseEmailAddressList
