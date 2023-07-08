import { isArray, isPlainObject, mergeWith, uniq, uniqWith } from 'lodash';
import { defaultQueryParams } from '../constants';
import { QueryParams } from '../interface';

export const generateParsedCurdRequest = (...query: QueryParams[]) => {
  const mergedResult = mergeWith(
    {},
    defaultQueryParams,
    ...query,
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        const mergedArray = objValue.concat(srcValue);
        if (isPlainObject(objValue[0])) {
          return uniqWith(mergedArray, (a, b) => a?.field === b?.field);
        } else {
          return uniq(mergedArray);
        }
      }
    },
  );
  // Parse Bool
  mergedResult.pagination = JSON.parse(JSON.stringify(mergedResult.pagination));
  mergedResult.cache = JSON.parse(JSON.stringify(mergedResult.cache));
  mergedResult.includeDeleted = JSON.parse(
    JSON.stringify(mergedResult.includeDeleted),
  );
  return mergedResult;
};
