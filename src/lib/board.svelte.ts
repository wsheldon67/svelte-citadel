import type { BoardData } from "./data";


export class Board {
  constructor(public data: BoardData) {
    this.data = data;
  }
}