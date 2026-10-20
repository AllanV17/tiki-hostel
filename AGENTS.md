## Proyecto

Tiki Hostel Ometepe es un sitio web informativo y promocional para un hostal ubicado en la Isla de Ometepe, Rivas, Nicaragua. Presenta el hostal, sus alojamientos, espacios, servicios, actividades, fotografías e información útil.

Los enlaces de contacto y reserva dirigirán a WhatsApp, redes sociales, Booking y Airbnb según corresponda, una vez confirmados sus destinos.

Esta versión no incluye ni implementará un sistema propio de reservas, pagos, autenticación, gestión de usuarios, base de datos, backend ni API.

## Tecnologías

- Astro y componentes `.astro`.
- TypeScript y JavaScript.
- CSS personalizado.
- `ClientRouter` y mecanismos de transiciones de Astro.
- APIs nativas del navegador y componentes propios.

GSAP y ScrollTrigger son opciones no instaladas; incorporarlas solo si una necesidad técnica concreta no se resuelve adecuadamente con las herramientas actuales.

No introducir React, Tailwind, Bootstrap ni otras tecnologías sin una justificación técnica concreta. Antes de añadir una librería, evaluar si el requisito puede resolverse con las herramientas ya disponibles.

## Diseño

La identidad visual de Tiki Hostel ya está definida. El código, los componentes y los estilos actuales son la referencia operativa. Figma no forma parte del flujo habitual de desarrollo; podrá utilizarse un diseño específico de Figma para la página 404 cuando se solicite implementarla.

Priorizar la calidad visual, el diseño responsive y la consistencia entre componentes. No realizar rediseños generales ni alteraciones visuales importantes sin autorización. Si una limitación técnica exige alterar significativamente el diseño, detenerse y consultarlo antes.

## Contenido

No inventar información comercial, tarifas, servicios, características, políticas, reseñas, contactos ni otros datos del hostal. Si falta información, utilizar un marcador provisional claramente identificable o consultar antes de completar el contenido.

## Implementación

Priorizar:

- Código limpio y mantenible.
- Componentización razonable.
- Diseño responsive real.
- Accesibilidad.
- SEO.
- Rendimiento.
- Simplicidad.

Evitar la sobreingeniería y las dependencias innecesarias. Utilizar CSS para animaciones sencillas y las transiciones de Astro cuando corresponda. Las animaciones deben mejorar la experiencia sin perjudicar el rendimiento, la accesibilidad ni la usabilidad.

## Metodología

Antes de realizar cambios importantes:

1. Inspeccionar los archivos relevantes y el estado actual del proyecto.
2. Respetar la arquitectura, las convenciones y los componentes existentes.
3. Proponer un plan cuando la tarea tenga un alcance significativo.
4. Implementar de forma incremental, con soluciones simples y mantenibles, sin cambios fuera del alcance solicitado.
5. Verificar de forma proporcional al cambio, con pruebas o compilaciones pertinentes cuando corresponda. Informar qué se verificó y qué quedó pendiente; no afirmar que algo fue validado sin evidencia suficiente.

Si una tarea requiere una decisión de negocio, diseño o arquitectura que no esté definida, no asumirla arbitrariamente: informar y solicitar aprobación.

## Desarrollo

Al iniciar el servidor de desarrollo, utilizar el modo en segundo plano:

```sh
astro dev --background
```

Gestionar el servidor en segundo plano con `astro dev stop`, `astro dev status` y `astro dev logs`.

## Documentación

Consultar `README.md` y los archivos pertinentes para comprender la arquitectura, configuración, rutas o estado del proyecto. Usar el código y la configuración como fuentes de verdad técnica.

Mantener actualizada la documentación existente cuando cambie información técnica relevante. No actualizarla por ajustes visuales menores o correcciones triviales, ni crear nuevos documentos sin una necesidad justificada o solicitud explícita. Evitar duplicar información entre documentos.

Para consultar el funcionamiento de Astro, usar su documentación oficial: https://docs.astro.build.
