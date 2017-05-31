import {CompositeDecorator} from 'draft-js';
import findWithRegex from 'find-with-regex';

const EMOJI_TRIGGER_REGEX = /(\s|^):[\w]*/g;

const findEmojiEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'EMOJI'
      );
    },
    callback
  );
};

const findEmojiTriggers = (contentBlock, callback) => {
  findWithRegex(EMOJI_TRIGGER_REGEX, contentBlock, callback);
};

const compositeDecorator = new CompositeDecorator([
  //{
  //  strategy: findEmojiEntities,
  //  component: Emoji
  //},
  {
    strategy: findEmojiTriggers,
    component: EmojiSuggestionsPortal
  }
]);

