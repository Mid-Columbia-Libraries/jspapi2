import JsPAPI from './src/scripts/JsPAPI';
import authorClean from './src/scripts/util/authorClean';
import bibParser from './src/scripts/util/bibParser';
import syndeticsURL from './src/scripts/util/syndeticsURL';
import itemURL from './src/scripts/util/itemURL';
import truncate from './src/scripts/util/truncate';

JsPAPI.util = {
  authorClean,
  bibParser,
  syndeticsURL,
  itemURL,
  truncate
};

export default JsPAPI;
