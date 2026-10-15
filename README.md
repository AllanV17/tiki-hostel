# Tiki Hostel Ometepe

## Descripción del proyecto

Sitio informativo y promocional de Tiki Hostel Ometepe. Presenta el alojamiento, sus espacios, actividades y vías de contacto en español e inglés. La versión actual no tiene reservas ni pagos propios, autenticación, base de datos, backend o API; las opciones de contacto y reserva previstas dependen de destinos externos que aún requieren confirmación.

## Tecnologías

- Astro 7, con componentes `.astro` y TypeScript en modo estricto.
- CSS propio y JavaScript/TypeScript para interacciones como carruseles y aparición de contenido al desplazarse.
- `ClientRouter` de Astro para la navegación con transiciones; `astro:assets` para imágenes locales.

`package.json` declara Astro como única dependencia de la aplicación. No hay un framework de componentes ni una librería de animación instalada.

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

El servidor en segundo plano se gestiona con `npm run astro -- dev status`, `npm run astro -- dev logs` y `npm run astro -- dev stop`. Los demás scripts disponibles en `package.json` son `npm run build` (compilación de producción), `npm run preview` (vista previa de la compilación) y `npm run astro -- <comando>` (CLI de Astro).

## Compilación y despliegue

`npm run build` genera el sitio estático en `dist/`. `astro.config.mjs` establece `site: 'https://allanv17.github.io'` y `base: '/tiki-hostel'` para GitHub Pages. Los enlaces internos deben pasar por las funciones de rutas localizadas o por `withBase` para conservar ese prefijo; el layout lo considera también al generar URLs canónicas y `hreflang`.

El flujo `.github/workflows/deploy.yml` compila y publica en GitHub Pages al recibir cambios en `main` o al ejecutarse manualmente.

## Estado y pendientes

**Implementado en el repositorio:** cuatro páginas por idioma, navegación y cambio de idioma, metadatos SEO básicos, diseño adaptable, carruseles y efectos de aparición. Hay fotografías locales junto con imágenes y textos marcados como provisionales.

**Pendiente de confirmación:** textos y afirmaciones comerciales, parte de la fotografía, datos prácticos y enlaces externos de contacto, mapa, redes sociales y plataformas de reserva. Los componentes y diccionarios muestran marcadores o destinos temporales para estos casos; su presencia no implica aprobación del contenido ni disponibilidad de la acción. Las URL y los datos finales deben confirmarse antes de sustituirlos.

## Instrucciones para agentes

[`AGENTS.md`](AGENTS.md) contiene las reglas de trabajo, los límites de alcance y los criterios de diseño y contenido para Codex. Consúltalo antes de modificar el proyecto.
