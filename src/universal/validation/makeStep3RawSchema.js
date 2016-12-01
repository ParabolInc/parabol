import legitify from './legitify';
import emailAddresses from 'email-addresses';

export default function makeStep3RawSchema() {
  return legitify({
    inviteesRaw: (value) => value
      .test((inviteesRaw) => {
        if (!inviteesRaw) return undefined;
        const parsedAddresses = emailAddresses.parseAddressList(inviteesRaw);
        if (!parsedAddresses) {
          let i = inviteesRaw.lastIndexOf(',');
          while (i > 0) {
            const lastGoodString = inviteesRaw.substr(0, i);
            const parseable = emailAddresses.parseAddressList(lastGoodString);
            if (parseable) {
              const startingIdx = lastGoodString.lastIndexOf(',') + 1;
              return `Problem parsing email after ${lastGoodString.substr(startingIdx)}`;
            }
            i = lastGoodString.lastIndexOf(',');
          }
          return 'That first email doesn\'t look right';
        }
        return undefined;
      })
  });
}
