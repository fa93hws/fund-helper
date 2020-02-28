export function deserializeNumber(object: any, field: string): number {
  if (typeof object[field] === 'number') {
    return object[field];
  }
  if (typeof object[field] === 'string') {
    const num = parseFloat(object[field]);
    if (Number.isNaN(num)) {
      throw new Error(`failed to parse ${object[field]} to number`);
    }
    return num;
  }
  throw new Error(`expect ${field} to be number, got ${typeof object[field]}`)
}

export function deserializeString(object: any, field: string): string {
  if (typeof object[field] === 'string') {
    return object[field];
  }
  throw new Error(`expect ${field} to be string, got ${typeof object[field]}`)
}

// deserialize YYYY-MM-DD date (BeiJing time) to javascript timestamp
export function deserializeDate(object: any, field: string): Date {
  const dateString = deserializeString(object, field);
  // Trade stop at 1500, beijing is UTC+8
  const timeDiff = (-8 + 15) * 3600 * 1000;
  const BeijingTimeStamp = new Date(dateString).getTime();
  if (Number.isNaN(BeijingTimeStamp)) {
    throw new Error(`failed to parse ${dateString} to date`);
  }
  return new Date(BeijingTimeStamp + timeDiff)
}
