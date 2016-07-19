export default function parseChannel(channelName) {
  const firstSlashLoc = channelName.indexOf('/');
  if (firstSlashLoc === -1) {
    return {channel: channelName};
  }
  const channel = channelName.substr(0, firstSlashLoc);
  const variableString = channelName.substr(firstSlashLoc + 1);
  return {channel, variableString};
}
