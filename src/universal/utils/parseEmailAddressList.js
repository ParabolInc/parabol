import emailAddresses from 'email-addresses';

const parseEmailAddressList = (rawStr = '') => {
  // this breaks RFC5322 standards, but people are not standard :-(
  const commaDelimStr = rawStr.replace(';', ',');
  return emailAddresses.parseAddressList(commaDelimStr);
};

export default parseEmailAddressList;