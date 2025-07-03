
export type EntityData = {
  kind: string,
  created_by: string,
}

export type EntityListData = {
  name: string,
  entities: EntityData[],
}

export type PlayerData = {
  name: string,
  personal_stash: EntityListData,
}

export type CoordinateData = `${number},${number}`

export type BoardData = {
  name: string,
  tiles: { [coordinate: CoordinateData]: EntityListData }
}


export type GameData = {
  lands_per_player: number,
  personal_pieces_per_player: number,
  community_pieces_per_player: number,
  citadels_per_player: number,
  players: PlayerData[],
  board: BoardData,
  turn: number,
  community_pool: EntityListData,
  graveyard: EntityListData,
}