import type { Tile } from '../tile';


export class Piece {
  tile: Tile | null = null;

  constructor(public data: any) {
    this.data = data;
  }

  move_to(target: Tile) {

  }

  capture_on(target: Tile, options: any = {}) {

  }

}


class Builder extends Piece {
  selected_land:Tile|null = null;

  can_move_to(target:Tile) {
    return target.is_orthagonal_to(this.tile!);
  }

  move_to(target:Tile) {
    this.selected_land = null;
    super.move_to(target);
  }

  capture_on(target:Tile) {
    this.selected_land = null;
    super.capture_on(target);
  }

  can_select_land(target:Tile) {
    if (!target.has_land) return false;
    if (!target.is_orthagonal_to(this.tile!)) return false;
    return true;
  }

  select_land(target:Tile) {
    this.selected_land = target;
  }

  can_move_selected_land(target:Tile) {
    if (!this.selected_land) return false;
    if (!this.selected_land.is_orthagonal_to(target)) return false;
    if (target.has_land) return false;
    return true;
  }

  move_selected_land(target:Tile) {
    this.selected_land!.land.move_to(target);
    this.selected_land = null;
  }
}


class Turtle extends Piece {
  can_move_to(target:Tile) {
    if (target.has_land) return false;
    if (!target.is_adjacent_to(this.tile!)) return false;
    return true;
  }

  can_place_on(target:Tile) {
    if (target.has_land) return false;
    return true;
  }

  can_capture_on(target:Tile) {
    if (target.is_orthagonal_to(this.tile!)) return true;
    if (target == this.tile) return true;
    return false;
  }

  capture_on(target:Tile) {
    super.capture_on(target, {take_place: false});
  }
}