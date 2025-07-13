

export function generateCode():string {
  const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += crockford[Math.floor(Math.random() * crockford.length)];
  }
  return code;
}

export function iter_enum_keys(enumObj: any): string[] {
  return Object.keys(enumObj).filter(key => !isNaN(Number(enumObj[key])))
}

export function iter_enum_values(enumObj: any): number[] {
  return Object.values(enumObj).filter(value => !isNaN(Number(value))) as number[];
}

export function iter_range(start: number, end: number): number[] {
  const range: number[] = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
}