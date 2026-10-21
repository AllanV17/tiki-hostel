# Tiki Hostel Ometepe

## Descripción del proyecto

Sitio informativo y promocional de Tiki Hostel Ometepe. Presenta el alojamiento, sus espacios, actividades y vías de contacto en español e inglés. La versión actual no tiene reservas ni pagos propios, autenticación, base de datos, backend o API; las opciones de contacto y reserva previstas dependen de destinos externos que aún requieren confirmación.

## Tecnologías

- Astro 7, con componentes `.astro` y TypeScript en modo estricto.
- CSS propio y JavaScript/TypeScript para interacciones como carruseles y aparición de contenido al desplazarse.
- `ClientRouter` de Astro para la navegación con transiciones; `astro:assets` para imágenes locales.

Fraunces y Manrope se sirven localmente desde `public/fonts/fonts.css`, enlazada por el layout mediante `withBase`. Sus URLs relativas conservan el prefijo de despliegue. Se incluyen tres WOFF2 latinos originales de Google Fonts (Fraunces v38 normal con ejes `wght`/`opsz`, cursiva 400 con eje `opsz`, y Manrope v20 normal con eje `wght`), sin conversiones ni modificaciones. Las declaraciones permiten Fraunces normal 400–900, cursiva 400 y Manrope normal 400–700, con `font-display: swap`. Ambas familias comparten los mismos recursos en ES/EN; no se cargan fuentes desde servidores externos. Los avisos de copyright y las licencias SIL OFL 1.1 se conservan en `public/fonts/fraunces/OFL.txt` y `public/fonts/manrope/OFL.txt`.

`package.json` declara Astro y su integración oficial `@astrojs/sitemap` como dependencias de la aplicación; TypeScript y `@astrojs/check` son dependencias de desarrollo para comprobar los tipos. No hay un framework de componentes ni una librería de animación instalada.

## Arquitectura

- `src/pages/`: rutas de Astro para ambos idiomas. Cada archivo carga una página compartida de `src/components/pages/`.
- `src/components/`: secciones, cabecera, pie y componentes compartidos. `src/layouts/Layout.astro` reúne metadatos, enlaces canónicos y alternativos, y el enrutador del cliente.
- `src/i18n/`: textos en `es.json` y `en.json`, selección del contenido en `index.ts` y correspondencia de rutas en `routes.ts`. El contenido español define la estructura tipada de ambos diccionarios.
- `src/styles/` y `src/scripts/`: estilos e interacciones. `src/assets/` contiene imágenes procesadas por Astro; `public/` contiene archivos servidos directamente.
- `src/utils/withBase.ts`: añade el prefijo de despliegue a los enlaces internos.

## Rutas e idiomas

El español es el idioma predeterminado. Las páginas equivalentes en inglés están bajo `/en/`:

| Página | Español | Inglés |
| --- | --- | --- |
| Inicio | `/` | `/en/` |
| Hostal | `/hostal/` | `/en/hostal/` |
| Actividades | `/actividades/` | `/en/actividades/` |
| Contacto | `/contacto/` | `/en/contacto/` |

`src/i18n/routes.ts` genera los enlaces localizados y permite cambiar de idioma conservando la página equivalente. Las rutas de la tabla son relativas al `base` de Astro; en el despliegue actual llevan el prefijo `/tiki-hostel`.

## Desarrollo local

Se requiere Node.js `>=22.12.0` y npm. Desde la raíz del repositorio:

```sh
npm ci
npm run dev -- --background
```

El servidor en segundo plano se gestiona con `npm run astro -- dev status`, `npm run astro -- dev logs` y `npm run astro -- dev stop`. Los demás scripts disponibles en `package.json` son `npm run check` (comprobación de tipos de Astro y TypeScript), `npm run build` (compilación de producción), `npm run preview` (vista previa de la compilación) y `npm run astro -- <comando>` (CLI de Astro).

## Compilación y despliegue

`npm run build` genera el sitio estático en `dist/`. `astro.config.mjs` establece `site: 'https://allanv17.github.io'` y `base: '/tiki-hostel'` para GitHub Pages. Los enlaces internos deben pasar por las funciones de rutas localizadas o por `withBase` para conservar ese prefijo; el layout lo considera también al generar URLs canónicas y `hreflang`.

El flujo `.github/workflows/deploy.yml` ejecuta `npm run check` antes de `npm run build` y publica en GitHub Pages al recibir cambios en `main` o al ejecutarse manualmente. Si falla la comprobación de tipos, la compilación y el despliegue no continúan.

## Página 404

`src/pages/404.astro` genera `dist/404.html`, que GitHub Pages sirve para rutas inexistentes bajo el proyecto. Reutiliza el layout, header y footer; ninguna sección de navegación queda activa y el CTA del header apunta a Contacto en el idioma correspondiente.

El HTML contiene español visible y una plantilla inglesa inerte. `src/scripts/not-found.ts` selecciona inglés si la ruta solicitada, tras retirar `base`, comienza por el segmento `/en`; las demás rutas muestran español. La selección se realiza en la carga inicial y antes del intercambio de documento de `ClientRouter`. Los controles ES/EN enlazan a la ruta fallida equivalente, conservando búsqueda y fragmento, sin redirigir automáticamente al inicio. Las preferencias guardadas no sustituyen el idioma de la URL ni abren la sugerencia de idioma en esta página.

Sin JavaScript se muestra español y un enlace visible «Back to home» al inicio inglés. La 404 mantiene `noindex, follow` en ambos modos de indexación, omite canonical, `hreflang` y `og:url`, y queda fuera del sitemap. Tras desplegar, comprobar rutas inexistentes ES/EN profundas, recursos bajo `base` y estado HTTP 404: abrir directamente `/404.html` no verifica el estado de error del hosting.

## Sitemap

La integración oficial `@astrojs/sitemap` genera `dist/sitemap-index.xml` y `dist/sitemap-0.xml` durante `npm run build`, a partir de las páginas estáticas y de `site` y `base`. Actualmente el índice corresponde a `https://allanv17.github.io/tiki-hostel/sitemap-index.xml` y el segundo archivo contiene las ocho URLs ES/EN. No se añaden fechas de modificación, prioridades ni frecuencias de cambio.

El sitemap se genera tanto con `noindex` como en modo indexable; no modifica la protección `PUBLIC_ALLOW_INDEXING` ni bloquea el rastreo. Las relaciones multilingües se mantienen únicamente en los `hreflang` del HTML, ya completos y recíprocos, para evitar mantener la misma información en dos lugares. No se crea `robots.txt`.

Al migrar al dominio definitivo, actualizar `site` y `base`, reconstruir y comprobar las ocho URLs del sitemap y sus canonical. Habilitar indexación seguirá requiriendo la aprobación y configuración explícitas descritas a continuación.

## Metadatos sociales

El layout genera Open Graph para las ocho rutas: `og:type=website`, título y descripción reutilizados de los metadatos SEO, `og:url` igual al canonical y `og:site_name` reutilizado del nombre del sitio en `content.layout.title`. Los locales son `es_NI` y `en_US`, con el otro como `og:locale:alternate`; `en_US` es la convención regional para la versión inglesa genérica, no una restricción de audiencia. ClientRouter intercambia las etiquetas del head al navegar; estos metadatos no se persisten entre páginas.

No se declaran imágenes ni tarjetas Twitter/X mientras no haya fotografía social aprobada. Por ahora tampoco se duplican título y descripción en etiquetas `twitter:*`; se evaluarán al completar la tarjeta. Para añadir `og:image` se necesita una imagen aprobada con derechos de uso, accesible mediante URL HTTPS absoluta, sus dimensiones y tipo MIME reales, y un texto `og:image:alt` descriptivo en ES/EN. Entonces se podrá elegir y verificar la tarjeta de Twitter/X correspondiente. Las previsualizaciones actuales dependen de cada plataforma y aún no incluyen una imagen social declarada.

## Control temporal de indexación

El layout añade una única etiqueta `<meta name="robots" content="noindex, follow">` a las ocho rutas salvo que `PUBLIC_ALLOW_INDEXING` tenga exactamente el valor `true`. La variable se evalúa durante la generación estática: cambiarla requiere reconstruir y desplegar. Ausente, vacía o con cualquier otro valor mantiene la protección; cambiar de dominio no la desactiva. No se bloquea el rastreo ni se crea `robots.txt`.

En GitHub Actions, el workflow toma la variable de repositorio `PUBLIC_ALLOW_INDEXING` y usa `false` si no existe. Tras la aprobación del propietario:

1. Revisar el dominio definitivo, `site`, `base`, canonical, `hreflang`, sitemap y configuración de rastreo antes de habilitar la indexación.
2. En GitHub, abrir **Settings → Secrets and variables → Actions → Variables**, crear o actualizar la variable de repositorio `PUBLIC_ALLOW_INDEXING` con el valor `true` y ejecutar nuevamente **Deploy to GitHub Pages** desde **Actions → Run workflow** sobre `main`. El workflow reconstruye y despliega; cambiar solo la variable no actualiza el sitio publicado.
3. Si se utiliza otro hosting, establecer `PUBLIC_ALLOW_INDEXING=true` en su entorno de build, ejecutar `npm run check` y `npm run build`, y publicar el nuevo `dist/`. Para una compilación local en PowerShell: `$env:PUBLIC_ALLOW_INDEXING = 'true'; npm run build`. Al terminar, retirar esa variable de la sesión con `Remove-Item Env:PUBLIC_ALLOW_INDEXING`.
4. Inspeccionar el código fuente HTML de las ocho URLs publicadas: no debe aparecer `noindex`; revisar también que el hosting no envíe una cabecera `X-Robots-Tag` restrictiva y que canonical y alternancias utilicen las URLs finales. La ausencia de la etiqueta permite indexación sin necesitar `index, follow` explícito.

Para volver al modo provisional, eliminar la variable o establecerla en `false` y reconstruir y desplegar. Solicitar `noindex` no retira inmediatamente páginas ya indexadas: el buscador necesita volver a rastrearlas.

Las pruebas se ejecutan con `node --test tests/*.test.mjs`. La prueba de indexación compila con `true` y después sin la variable, comprueba las ocho rutas y las URLs del sitemap en ambos modos y deja `dist/` protegido. Esa compilación final es de prueba; para publicar un sitio indexable hay que reconstruir después con el valor aprobado.

## Estado y pendientes

**Implementado en el repositorio:** cuatro páginas por idioma, navegación y cambio de idioma, metadatos SEO básicos, diseño adaptable, carruseles y efectos de aparición. Hay fotografías locales junto con imágenes y textos marcados como provisionales.

**Pendiente de confirmación:** textos y afirmaciones comerciales, parte de la fotografía, datos prácticos y enlaces externos de contacto, mapa, redes sociales y plataformas de reserva. Los componentes y diccionarios muestran marcadores o destinos temporales para estos casos; su presencia no implica aprobación del contenido ni disponibilidad de la acción. Las URL y los datos finales deben confirmarse antes de sustituirlos.

## Instrucciones para agentes

[`AGENTS.md`](AGENTS.md) contiene las reglas de trabajo, los límites de alcance y los criterios de diseño y contenido para Codex. Consúltalo antes de modificar el proyecto.
