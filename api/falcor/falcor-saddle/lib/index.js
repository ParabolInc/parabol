
const routeSuffixLength = '.length';
const routeSuffixRanges = '[{ranges:indexRanges}]';
const routeSuffixById = 'ById';
const routeSuffixByIdKeys = routeSuffixById + '[{keys:ids}]';

const defModelIdKey = 'id';
const defModelKeyGetter = (model, key) => model[key];
const defModelIdGetter = (model) => defModelKeyGetter(model, defModelIdKey);

export function getLengthRoute(routeBasename, modelPromise) {
  return {
    route: routeBasename + routeSuffixLength,
    async get(pathSet) {
      const length = await modelPromise();
      return {
        path: pathSet,
        value: length
      };
    }
  };
}

/*
 * modelPromise = async (from, to) => [modelObject, ...]
 * from, to is range inclusive (i.e. from=0, to=0 is 1 element)
 *
 * modelIdGetter = (modelObject) => modelObject.id
 */

export function getRangesRoute(routeBasename, modelPromise,
                                modelIdGetter = defModelIdGetter) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  return {
    route: routeBasename + routeSuffixRanges,
    async get(pathSet) {
      const responses = [ ];
      for (const {from, to} of pathSet.indexRanges) {
        const modelObjs = await modelPromise(from, to);
        for (let idx = 0; idx < modelObjs.length; idx++) {
          const response = {
            path: [routeBasename, from + idx ],
            value: {
              $type: 'ref',
              value: [routeByIdBasename, modelIdGetter(modelObjs[idx]) ]
            }
          };
          responses.push(response);
        }
      }
      return responses;
    }
  };
}

/*
 * modelPromise = async ([id, ...]) => [modelObject, ...]
 * modelKeyGetter = (modelObject, key) => modelObject[key]
 */

export function getByIdRoute(routeBasename, acceptedKeys, modelPromise,
                              modelKeyGetter = defModelKeyGetter,
                              modelIdKey = defModelIdKey) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  const keysString = ('[' + acceptedKeys.map( (key) => '"' + key + '"') + ']');

  return {
    route: routeBasename + routeSuffixByIdKeys + keysString,
    async get(pathSet) {
      const attributes = pathSet[2];
      const modelObjs = await modelPromise(pathSet[1]);
      const responses = [ ];
      for (const modelObj of modelObjs) {
        for (const attribute of attributes) {
          const response = {
            path: [routeByIdBasename, modelKeyGetter(modelObj, modelIdKey), attribute],
            value: modelKeyGetter(modelObj, attribute)
          };
          responses.push(response);
        }
      }

      return responses;
    }
  };
}

export function getRoutes(routeBasename, acceptedKeys,
                   getLengthModelPromise,
                   getRangeModelPromise,
                   getByIdsModelPromise,
                   modelKeyGetter = defModelKeyGetter,
                   modelIdKey = defModelIdKey) {
  const modelIdGetter = (model) => defModelKeyGetter(model, modelIdKey);

  return [
    getLengthRoute(routeBasename, getLengthModelPromise),
    getRangesRoute(routeBasename, getRangeModelPromise,
                    modelIdGetter),
    getByIdRoute(routeBasename, acceptedKeys, getByIdsModelPromise,
                  modelKeyGetter, modelIdKey)
  ];
}
