import type { EntityData } from "./data";


export class Entity {
  data: EntityData
  img_path: string;

  constructor(data: EntityData) {
    this.data = data
    this.img_path = 'default image path; override in subclasses'
  }

}