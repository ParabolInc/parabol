import {MaybeReadonly} from '../types/generics'

export default (tags: MaybeReadonly<string[]>) => !!tags.includes('archived')
