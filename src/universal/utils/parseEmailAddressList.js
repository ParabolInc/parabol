import emailAddresses from 'email-addresses';

const parseEmailAddressList = (rawStr = '') => {
  // this breaks RFC5322 standards, but people are not standard :-(
  window.raw = rawStr;
  const commaDelimStr = rawStr
    // replace line breaks & semi colons with commas
    .replace(/(?:\r\n|\r|\n|;)/g, ',')
    // if the above created 2 commas (like a , + linebreak), remove dupes
    .replace(/,+/g, ',')
    // remove leading/trailing whitespace
    .trim()
    // remove trailing commas
    .replace(/,$/g, '');
  return emailAddresses.parseAddressList(commaDelimStr);
};

export default parseEmailAddressList;
