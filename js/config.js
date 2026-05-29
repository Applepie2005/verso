/**
 * Textos y fondo. Galería: `js/media-manifest.json`.
 * Música: YouTube al pulsar Sí (`youtubeBackground`).
 */
window.MUSICALION_CONFIG = {
  backgroundImage: "media/PXL_20260510_000001376.jpg.jpeg",
  backgroundFallback: "https://picsum.photos/seed/musicalion-hero/1920/1080/grayscale",

  /**
   * Canción de fondo: ID de 11 caracteres o URL (youtu.be, watch, embed).
   * https://youtu.be/62WV4tFEh0Q
   */
  youtubeBackground: "https://youtu.be/62WV4tFEh0Q?si=cthUotGPVUVoEaHz",

  /**
   * Duración total de la canción (ms). Todas las fotos de `media-manifest.json` se reparten
   * este tiempo a partes iguales (una pasada completa, al ritmo de la música ~3:58).
   */
  gallerySongDurationMs: (3 * 60 + 58) * 1000,

  autoTimings: {
    introToQuestionMs: 5400,
    pauseBeforeRestartMs: 450,
  },

  /**
   * Solo si falla `js/media-manifest.json`: rutas manuales en `slides`.
   */
  memories: [],
};
