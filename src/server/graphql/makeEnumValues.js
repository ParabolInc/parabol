export default function makeEnumValues(constArr) {
  return constArr.reduce((values, constant) => {
    values[constant] = {value: constant};
    return values;
  }, {});
}
