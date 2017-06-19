import {testForOData, optionsFromOData} from './options_from_odata';
import {optionsFromSimple} from './options_from_simple';

export default req => {
  const syntax = testForOData(req) ? optionsFromOData : optionsFromSimple;
  return syntax(req);
};
