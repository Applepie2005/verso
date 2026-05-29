# Publicar Musicalion en GitHub Pages

GitHub Pages solo sirve archivos desde la **raíz del origen** que elijas (carpeta `/` del branch o la carpeta **`/docs`**). No “entra” solo dentro de subcarpetas: por eso, si subiste el repo con esta forma…

```text
tu-repo/
  musicalion/          ← aquí está index.html, css/, js/, media/…
    index.html
    css/
    js/
```

…la URL `https://TU_USUARIO.github.io/TU_REPO/` **no** tiene un `index.html` en la raíz y parece que “no reconoce” el HTML.

Tienes **dos formas buenas** de arreglarlo.

---

## Opción A — Dejar la carpeta `musicalion/` (recomendada si ya subiste así)

En este repo ya hay en la **raíz** un `index.html` que **redirige** a `musicalion/`.

1. Sube el **repositorio completo** (incluida la carpeta `musicalion` y el `index.html` de la raíz).
2. En GitHub: **Settings → Pages**.
3. **Build and deployment → Source:** *Deploy from a branch*.
4. **Branch:** `main` (o la que uses), carpeta **`/ (root)`**, Save.
5. Espera 1–2 minutos y prueba:
   - `https://TU_USUARIO.github.io/TU_REPO/` → debe redirigir a Musicalion.
   - O directamente: `https://TU_USUARIO.github.io/TU_REPO/musicalion/`

También está el archivo **`.nojekyll`** en la raíz para que GitHub **no** procese el sitio con Jekyll y no oculte carpetas/archivos por error.

---

## Opción B — Todo en la raíz del repo (como muchos tutoriales de Pages)

Si prefieres que la web abra **solo** con `https://TU_USUARIO.github.io/TU_REPO/` sin `/musicalion/`:

1. Mueve **el contenido** de `musicalion/` a la raíz del repo (no la carpeta vacía, sino `index.html`, `css/`, `js/`, `media/`, `assets/`, `scripts/`, etc.).
2. La raíz debe quedar así:

   ```text
   tu-repo/
     index.html
     css/
     js/
     media/
     …
   ```

3. Puedes borrar la carpeta `musicalion/` vacía y el `index.html` de redirección de la raíz si ya no hace falta.
4. En **Pages**, sigue con branch **`/ (root)`**.

Las rutas del proyecto (`css/styles.css`, `js/...`) son relativas y seguirán funcionando.

---

## Cómo “subir bien” los archivos (resumen)

- **Mal:** subir solo un ZIP que al descomprimir queda `musicalion/musicalion/index.html` (doble carpeta).
- **Bien:** que en el repo la ruta sea `musicalion/index.html` **una sola vez**, al mismo nivel que `css/`, `js/`, `media/`.

Desde tu PC, con Git en la carpeta del repo:

```bash
git add .
git status   # revisa que index.html y musicalion/ estén listados
git commit -m "Ajuste GitHub Pages: raíz + musicalion"
git push
```

Si usas la **web de GitHub** (“Add file → Upload files”), arrastra **los archivos y carpetas que van dentro de `musicalion`**, o sube el repo ya bien ordenado desde GitHub Desktop / Cursor.

---

## Si sigue fallando

- Comprueba que **Pages** esté en el **mismo branch** donde hiciste push.
- Prueba en ventana privada (caché).
- Abre `…/musicalion/index.html` en la barra de direcciones: si carga, el problema era solo la raíz (la opción A lo cubre).
