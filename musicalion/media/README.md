# Media (fotos y vídeos)

Aquí van las **fotos** de la galería. La página muestra **todas** las fotos del manifiesto, **una cada vez** con fundido automático (sin scroll).

## Al cambiar fotos

Desde la carpeta `musicalion/`:

```bash
node scripts/generate-media-manifest.mjs
```

Eso vuelve a generar `js/media-manifest.json` con todas las imágenes (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) ordenadas por nombre.

Si ese archivo falta o está vacío, la app usa como respaldo el array `memories` en `js/config.js` (rutas en `slides`).

## Buenas prácticas

- **Misma app, misma raíz:** `musicalion/media/` junto a `index.html`.
- **Nombres claros** (sin espacios o caracteres raros si puedes).
- **Peso:** comprime JPEG/WEBP para móvil.

El tiempo en **cada foto** es la duración de la canción (`gallerySongDurationMs` en `js/config.js`, por defecto 3:58) **dividido entre el número de fotos** del manifiesto, para recorrer todas una vez hasta que coincide con esa duración.
