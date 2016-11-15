export default function parseChannel(channelName) {
  const firstSlashLoc = channelName.indexOf('/');
  if (firstSlashLoc === -1) {
    return {channel: channelName};
  }
  return {
    channel: channelName.substr(0, firstSlashLoc),
    variableString: channelName.substr(firstSlashLoc + 1)
  };
}
