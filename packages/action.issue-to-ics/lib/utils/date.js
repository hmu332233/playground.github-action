'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getTimeArray = void 0;
const dayjs_1 = __importDefault(require('dayjs'));
const utc_1 = __importDefault(require('dayjs/plugin/utc'));
const timezone_1 = __importDefault(require('dayjs/plugin/timezone'));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
function getTimeArray(dateString, timezone) {
  const dayjsObj = dayjs_1.default.tz(dateString, timezone).utc();
  return [
    dayjsObj.get('year'),
    dayjsObj.get('month') + 1,
    dayjsObj.get('date'),
    dayjsObj.get('hour'),
    dayjsObj.get('minute'),
  ];
}
exports.getTimeArray = getTimeArray;
