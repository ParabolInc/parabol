import EditorLink from './EditorLink';
import {CompositeDecorator} from 'draft-js';
import Hashtag from 'universal/components/TaskEditor/Hashtag';
import Mention from 'universal/components/TaskEditor/Mention';

const findEntity = (entityType) => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === entityType
      );
    },
    callback
  );
};

const decorators = new CompositeDecorator([
  {
    strategy: findEntity('LINK'),
    component: EditorLink
  },
  {
    strategy: findEntity('TAG'),
    component: Hashtag
  },
  {
    strategy: findEntity('MENTION'),
    component: Mention
  }
]);

export default decorators;
