export const StateModel = {
  activeMapKey: 'DEFAULT_MAP',
  get map() { return this.savedMaps[this.activeMapKey] },
  savedMaps: {
    DEFAULT_MAP: {
      key: 'map-maker-save-1',
      createdDate: '11/22/2022',
      modifiedDate: '11/22/2022',
      author: {
        name: 'Jake',
        id: '1'
      },
      mapName: 'test1',
      dims: { width: 1, height: 1 },
      tiles: [
        {
          address: '0,0',
          type: 0
        },
      ],

      map: {}
    }
  }
}

export const AuthorModelType = {
  name: String,
  id: String,
}

export const MapDimensionsModelType = {
  width: Number,
  height: Number,
}

export const TileTypes = [0]

// export const TileAddressModelType = {
//   address: '0,0',
//   type: 0
// }

export const TileModelType = {
  address: String,
  type: Number
}

export const MapModelType = {
  key: String,
  createdDate: Date,
  modifiedDate: Date,
  author: AuthorModelType,
  mapName: String,
  dims: MapDimensionsModelType,
  tiles: [TileModelType],
}

export const StateModelType = {
  savedMaps: {
    MAP_NAME: MapModelType
  }
}

export const DEFAULT_STATE = {
  savedMaps: {
    DEFAULT_MAP: {
      key: 'map-maker-save-1',
      mapName: 'test1',
      createdDate: '11/22/2022',
      modifiedDate: '11/22/2022',
      author: {
        name: 'Jake',
        id: '1'
      },
      dims: { width: 1, height: 1 },
      tiles: [
        {
          address: '0,0',
          type: 0
        },
      ],
    }
  }
}