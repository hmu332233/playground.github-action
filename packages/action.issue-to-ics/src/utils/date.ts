import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type DateArray =
  | [number, number, number, number, number]
  | [number, number, number, number]
  | [number, number, number];

export function getTimeArray(dateString: string, timezone: string): DateArray {
  const dayjsObj = dayjs.tz(dateString, timezone).utc();
  return [
    dayjsObj.get('year'),
    dayjsObj.get('month') + 1,
    dayjsObj.get('date'),
    dayjsObj.get('hour'),
    dayjsObj.get('minute'),
  ];
}
