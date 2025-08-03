import type { CoordinateData } from "./data";


export class Coordinate {

  constructor(public data: CoordinateData) {
    
  }

  get x(): number {
    return parseInt(this.data.split(',')[0]);
  }

  get y(): number {
    return parseInt(this.data.split(',')[1]);
  }
}