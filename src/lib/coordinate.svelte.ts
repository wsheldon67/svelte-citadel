import type { CoordinateData } from "./data";


export class Coordinate {
  data: CoordinateData = $state('0,0')
  x: number = $derived.by(() => parseInt(this.data.split(',')[0]))
  y: number = $derived.by(() => parseInt(this.data.split(',')[1]))

  constructor(data: CoordinateData) {
    this.data = data;
  }
}