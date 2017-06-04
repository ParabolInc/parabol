import {tags} from 'universal/utils/constants';
import emojiArray from 'universal/utils/emojiArray';
import stringScore from 'string-score';

export const resolveEmoji = async (query) => {
  if (!query) {
    return emojiArray.slice(2, 8);
  }
  return emojiArray.map((obj) => ({
    ...obj,
    score: stringScore(obj.value, query)
  }))
    .sort((a, b) => a.score < b.score ? 1 : -1)
    .slice(0, 6)
    // ":place of worship:" shouldn't pop up when i type ":poop"
    .filter((obj, idx, arr) => obj.score > 0 && arr[0].score - obj.score < 0.3);
};

export const resolveHashTag = async (query) => {
  return tags.filter((tag) => tag.name.startsWith(query));
};

export default {
  emoji: resolveEmoji,
  tag: resolveHashTag
}