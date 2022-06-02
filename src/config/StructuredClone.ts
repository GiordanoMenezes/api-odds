
import v8 from 'v8';

export const structuredClone = (obj:Object) => {
  return v8.deserialize(v8.serialize(obj));
};