import publish from 'server/utils/publish';
import groupBy from 'universal/utils/groupBy';

/* Sometimes, we need to filter the data down before publishing to a channel.
 * For example, approveToOrg might return an array of all the orgApproval
 * but we want to batch those by teamId and publish them on the orgApproval.teamId channel
 *
 */

const publishBatch = (topic, channelKey, type, dataArray, subOptions, payloadMaker) => {
  const groupedByChannel = groupBy(dataArray, channelKey);
  const channels = Object.keys(groupedByChannel);
  for (let ii = 0; ii < channels.length; ii++) {
    const channel = channels[ii];
    const val = groupedByChannel[channel];
    publish(topic, channel, type, payloadMaker(val), subOptions);
  }
};

export default publishBatch;
