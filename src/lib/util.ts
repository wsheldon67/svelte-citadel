import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase";


export function generate_code(length: number = 4):string {
  const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let code = "";
  for (let i = 0; i < length; i++) {
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

const img_url_cache = new Map<string, string>()

export async function get_img_url(path:string):Promise<string> {
  if (!img_url_cache.has(path)) {
    const image_ref = ref(storage, path)
    const url = await getDownloadURL(image_ref);
    img_url_cache.set(path, url);
  }
  return img_url_cache.get(path)!;
}