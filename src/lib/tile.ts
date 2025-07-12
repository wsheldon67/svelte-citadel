

export class Tile {
  x: number;
  y: number;

  constructor(data:any) {
    this.x = data.x;
    this.y = data.y;
  }

  is_orthagonal_to(other: Tile): boolean {
    return (this.x === other.x || this.y === other.y);
  }

  is_adjacent_to(other: Tile): boolean {
    return (Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1);
  }

  get has_land(): boolean {
    return true;
  }

  get land(): any | null {
    return null;
  }
}