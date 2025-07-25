
export type EntityData = {
  kind: string
  created_by: string
  owner: string|null
  id: string
}

export type EntityListData = {
  name: string
  entities: EntityData[]
}

export type PlayerData = {
  name: string
  id: string
  personal_stash: EntityListData
  piece_selection_confirmed: boolean
  player_order: number
}

export type CoordinateData = `${number},${number}`

export type BoardData = {
  name: string,
  tiles: { [coordinate: CoordinateData]: EntityListData }
}


export enum GamePhase {
  LOBBY,
  LAND_PLACEMENT,
  PIECE_SELECTION,
  BATTLE,
  END,
}


export type GameData = {
  lands_per_player: number
  personal_pieces_per_player: number
  community_pieces_per_player: number
  citadels_per_player: number
  players: {[id: string]: PlayerData}
  board: BoardData
  turn: number
  community_pool: EntityListData
  graveyard: EntityListData
  phase: GamePhase
}