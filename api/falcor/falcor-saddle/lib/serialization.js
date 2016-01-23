import * as _ from 'lodash';

function defSerializer(obj) {
  if (_.isBoolean(obj) ||
      _.isNumber(obj) ||
      _.isString(obj) ||
      _.isNull(obj) || _.isUndefined(obj)) {
    return obj;
  }
  // Fallback to JSON serialization:
  return JSON.stringify(obj);
}

export default function serialize(obj, serializer = defSerializer) {
  return serializer(obj);
}
