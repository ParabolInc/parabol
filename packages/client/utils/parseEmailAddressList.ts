import {parseAddressList, parseOneAddress} from 'email-addresses'

const getFilteredStr = (
  commaDelimStr: string,
  isAddingNewEmail: boolean,
  isOutlookList: boolean,
  lastEmailIndex: number
) => {
  if (isAddingNewEmail) {
    return commaDelimStr
      .slice(0, lastEmailIndex)
      .trim()
      .replace(/,$/g, '')
  } else if (isOutlookList) {
    const outlookEmails = [] as string[]
    for (let i = 0; i < commaDelimStr.length; i++) {
      const letter = commaDelimStr[i]
      if (letter === '<' && i !== commaDelimStr.length - 1) {
        const newEmail = [] as string[]
        for (let j = i + 1; j < commaDelimStr.length; j++) {
          if (commaDelimStr[j] === '>') {
            outlookEmails.push(newEmail.join(''))
            break
          }
          newEmail.push(commaDelimStr[j])
        }
      }
    }
    return outlookEmails.join(',')
  }
  return commaDelimStr
}

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
  const lastEmailIndex = Math.max(commaDelimStr.lastIndexOf(' '), commaDelimStr.lastIndexOf(','), 0)
  const lastEmail = commaDelimStr.slice(lastEmailIndex, commaDelimStr.length)
  const lastChar = rawStr.charAt(rawStr.length - 1)

  const isAddingNewEmail = lastChar !== ' ' && lastChar !== ',' && !parseOneAddress(lastEmail)
  const isOutlookList =
    0 < commaDelimStr.indexOf('<') &&
    commaDelimStr.indexOf('<') < commaDelimStr.indexOf('@') &&
    commaDelimStr.indexOf('@') < commaDelimStr.indexOf('>')

  if (emailCount === 1 && isAddingNewEmail) {
    return {
      parsedInvitees: parseAddressList(commaDelimStr),
      invalidEmailExists: false
    }
  }

  // if adding a new email, return everything except the final email, remove
  // leading/trailing whitespace and remove trailing commas
  const filteredStr = getFilteredStr(commaDelimStr, isAddingNewEmail, isOutlookList, lastEmailIndex)
  // const filteredStr = isAddingNewEmail
  //   ? commaDelimStr
  //       .slice(0, lastEmailIndex)
  //       .trim()
  //       .replace(/,$/g, '')
  //   : commaDelimStr
  const parsedFilteredInvitees = parseAddressList(filteredStr)

  if (parsedFilteredInvitees) {
    return {
      parsedInvitees: parsedFilteredInvitees,
      invalidEmailExists: false
    }
  }
  // if parsedFilteredInvitees is invalid, it'll be null. Check if
  // there's a valid email in the invalid list
  else {
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
