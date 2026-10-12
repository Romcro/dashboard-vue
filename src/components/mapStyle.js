// Open satellite basemap (Esri World Imagery), no API key needed
export const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagerie © Esri, Maxar, Earthstar Geographics'
    }
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }]
}
