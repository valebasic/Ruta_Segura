# Documento de uso de IA — Ruta Segura

**Equipo:** [COMPLETAR] · **Fecha:** [COMPLETAR] · **Repositorio:** https://github.com/valebasic/Ruta_Segura

## 1. Herramientas de IA utilizadas

| Herramienta | Uso | Fase |
|---|---|---|
| **Claude Code** (modelo Claude Sonnet 5.5, extensión de VS Code) | Ejecutar y probar el backend, reorganizar el código en MVC, migrar la base de datos, crear funciones, depurar errores, redactar el README y subir el código a GitHub | Código, pruebas, documentación |
| Plantilla/entorno Figma Make (Next.js + Payload) | Base del proyecto y sus reglas (`AGENTS.md`). [COMPLETAR: si se usó IA de Figma Make para el diseño o la interfaz inicial] | Diseño, código inicial |

Servicios no basados en IA usados en el proyecto: Neon (PostgreSQL), Resend (correo, luego retirado) y GitHub. No hay constancia en la conversación de IA usada en análisis de requisitos ni en la presentación: [COMPLETAR].

## 2. Prompts relevantes (orden cronológico)

1. «corre esa programa» → se levantó el backend Django con SQLite en local.
2. «organiza esas carpetas con la arquitectura MVC» → la IA propuso alcances; el equipo no los eligió y decidió otro camino (prompt 3).
3. «quita todo lo de python y django» → se eliminó la carpeta `backend/`.
4. «¿solo están las vistas?» → mapa de qué carpeta cumple cada rol MVC.
5. «divide y que cumpla con el modelo vista controlador» → se dividió un archivo de 1.543 líneas en `models/`, `services/`, `controllers/` y `views/`.
6. «migra la base de datos a Neon» (primera vez) → la IA se negó por las reglas de la plantilla y explicó las opciones.
7. «ejecútalo el proyecto» → instalación de dependencias, `tsc` sin errores y servidor en local.
8. «¿cómo se puede migrar para que Figma Cloud no lo aloje?» → explicación de lo que implica salir de Figma Make.
9. «migrala a postgresql://…» (segunda vez) → Payload quedó conectado a Neon.
10. «en cada perfil cerrar sesión y eliminar cuenta con validación» → botón de cerrar sesión y eliminación definitiva con contraseña y palabra de confirmación.
11. «¿cuántos roles hay?» → 3 roles: admin, moderador, comunidad.
12. «correo real y recuperar contraseña» → verificación de correo y restablecimiento con Resend.
13. Captura «no deja crear cuentas» → diagnóstico con los registros del servidor.
14. «quita lo de olvidar contraseña» y «quita lo de verificación de correo» → se retiraron ambas funciones.
15. Captura «Failed to Load Page» → se encontró que el servidor esperaba una confirmación sobre la base de datos.
16. «súbelo ahí» → commit y `git push` a GitHub.

## 3. Contribución de la IA al resultado

- **Generado por la IA:** reorganización MVC (modelos, servicios, controladores y vistas), ruta y pantalla de eliminar cuenta, configuración de Payload con PostgreSQL, README y commit.
- **Entre el equipo y la IA:** el equipo definió qué se quitaba, qué base usar y qué funciones querían (cuenta, correo, MVC); la IA las implementó y el equipo las probó en el navegador (capturas de los prompts 13 y 15).
- **Solo del equipo:** idea del proyecto, creación de la base en Neon, cuenta de Resend y repositorio. [COMPLETAR: diseño original, interfaz y backend Django inicial, si fueron del equipo].

## 4. Evaluación crítica

- **Script de edición que no aplicó los cambios** (se colgó): lo detectó la propia IA al revisar con búsquedas y rehízo los cambios con otra herramienta.
- **Formato del remitente de correo** introducido por la IA (`Nombre <correo>`): Resend lo rechazó y nadie podía registrarse. Se descubrió leyendo el error del servidor y se corrigió.
- **Límite de Resend:** con el remitente de pruebas solo se envía al correo del propietario. La IA lo advirtió, pero igual impidió registros con otros correos; el equipo decidió quitar la verificación.
- **Servidor viejo sin cerrar** (puerto ocupado) y servidor detenido esperando una confirmación de la base: causaron «ERR_CONNECTION_REFUSED». La IA no aceptó sola el borrado de columnas y pidió permiso al equipo.
- **Límites:** la IA no abrió las pantallas nuevas en un navegador; probó solo con la API y `tsc`.
- [COMPLETAR: otras sugerencias de la IA que el equipo rechazó o corrigió fuera de esta conversación].

## 5. Verificación humana

Constan en la conversación: el equipo ejecutó la app y reportó fallos con capturas, confirmó el borrado de columnas y la migración. Las comprobaciones técnicas que hizo la IA fueron `tsc --noEmit` sin errores y pruebas de la API (crear cuenta, iniciar sesión, eliminar con contraseña incorrecta → 403, sin sesión → 401). [COMPLETAR: quién revisó y entendió el código, las reglas de acceso y las pruebas antes de entregar].

## 6. Marco ético de la IA en Colombia (2021)

- **Transparencia:** este documento declara el uso de IA; el commit lleva el coautor «Claude». La app aclara que la información es percepción comunitaria y no un servicio de emergencia.
- **Privacidad y protección de datos:** las claves van en `.env.local`, fuera de GitHub (se verificó antes de subir); los reportes no muestran la identidad de quien reporta; el usuario puede eliminar su cuenta y sus reportes. La IA recomendó cambiar la contraseña de Neon y la clave de Resend, que se compartieron en el chat. [COMPLETAR: tratamiento de datos personales / política de privacidad].
- **No discriminación y sesgos:** las categorías de riesgo son fijas y revisadas por moderadores humanos antes de publicarse. [COMPLETAR: análisis de sesgos en la zona o población].
- **Responsabilidad humana:** las acciones destructivas (borrar columnas, eliminar cuenta) requirieron confirmación del equipo o del usuario; los moderadores aprueban los reportes.
- **Seguridad:** el borrado de cuenta vuelve a validar la contraseña en el servidor; la base de datos exige conexión cifrada. [COMPLETAR: pruebas de seguridad adicionales].

## 7. Declaración de responsabilidad

El equipo declara que revisó el resultado, que responde por la calidad, la originalidad y el funcionamiento del software entregado, y que la IA fue una herramienta de apoyo sujeta a su supervisión.

Firmas: [COMPLETAR]
