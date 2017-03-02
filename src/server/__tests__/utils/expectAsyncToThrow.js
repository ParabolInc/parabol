export default async function expectAsyncToThrow(promise) {
  try {
    await promise;
    throw new Error(`Jest: promise did not throw! ${Math.random()}`);
  } catch (e) {
    expect(() => { throw e; }).toThrowErrorMatchingSnapshot();
  }
};
