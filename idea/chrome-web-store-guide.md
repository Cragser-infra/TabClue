# Guía: Publicar TabClue en Chrome Web Store

## Resumen del proceso

Esta guía documenta todo lo que hicimos para publicar TabClue en Chrome Web Store y configurar la publicación automática con GitHub Actions.

---

## 1. Preparación del build

La extensión se construye con WXT (framework para extensiones de Chrome):

```bash
pnpm build
```

Esto genera la carpeta `.output/chrome-mv3/` con todos los archivos listos. Para subirla manualmente, se crea un ZIP:

```bash
cd .output/chrome-mv3 && zip -r ../../tabclue.zip .
```

---

## 2. Cuenta de desarrollador

Para publicar en Chrome Web Store necesitas una cuenta de desarrollador:

- Se registra en https://chrome.google.com/webstore/devconsole
- Cuesta $5 USD (pago único)
- Una vez registrada, puedes subir extensiones desde el Developer Console

---

## 3. Creación del listing

Al crear un nuevo item en el Developer Console, se llenan estos campos:

### Store listing (pestaña principal)
- **Name**: TabClue
- **Description**: Descripción larga de la extensión (mínimo 25 caracteres)
- **Category**: Productivity
- **Language**: English (con soporte para Spanish)
- **Screenshots**: Mínimo 1, tamaño 1280x800 o 640x400
- **Homepage URL**: `https://github.com/Cragser-infra/TabClue`
- **Support URL**: `https://github.com/Cragser-infra/TabClue/issues`

### Privacy practices (pestaña de privacidad)

**Single purpose description**: Una frase que explica qué hace la extensión. Chrome lo requiere para validar que todos los permisos son necesarios para ese propósito.

**Justificaciones de permisos**: Por cada permiso en el manifest, Chrome pide que expliques POR QUÉ lo necesitas. Si no lo justificas, te rechazan la extensión.

**Data usage**: Declaración pública de qué datos recopilas. En nuestro caso:
- Web history (guardamos URLs y títulos)
- User activity (contamos frecuencia de visitas)

**Certificaciones**: 3 checkboxes obligatorios:
1. No vendes datos a terceros
2. No usas datos para propósitos ajenos
3. No usas datos para evaluar crédito

**Privacy policy URL**: Chrome requiere una política de privacidad pública si recopilas datos. Creamos `PRIVACY.md` en el repo.

---

## 4. Permisos de la extensión explicados

Cada permiso en `wxt.config.ts` le da a la extensión acceso a APIs específicas de Chrome. Los usuarios ven estos permisos al instalar.

### `tabs`
**Qué hace**: Permite acceder a `chrome.tabs.query()` para leer la URL, título y favicon de las pestañas abiertas.

**Por qué lo necesitamos**: Sin este permiso, no podemos saber qué pestañas tiene abiertas el usuario para guardarlas.

**Qué ve el usuario**: "Read your browsing activity"

### `bookmarks`
**Qué hace**: Permite acceder a `chrome.bookmarks.search()` para buscar URLs en los marcadores del usuario.

**Por qué lo necesitamos**: Para mostrar el indicador de bookmark (ícono de estrella) junto a las pestañas que el usuario ya tiene guardadas en marcadores.

**Qué ve el usuario**: "Read and change your bookmarks"

### `storage`
**Qué hace**: Permite usar `chrome.storage.local` para guardar datos de forma persistente.

**Por qué lo necesitamos**: Para persistir las pestañas guardadas, sesiones y configuración del usuario entre reinicios del navegador.

**Qué ve el usuario**: No muestra advertencia visible.

### `unlimitedStorage`
**Qué hace**: Elimina el límite de 10 MB que tiene `chrome.storage.local` por defecto.

**Por qué lo necesitamos**: Un usuario con miles de pestañas guardadas puede superar fácilmente los 10 MB. Sin este permiso, la extensión dejaría de funcionar al llenarse.

**Qué ve el usuario**: No muestra advertencia visible.

### `favicon`
**Qué hace**: Permite acceder a `chrome.runtime.getURL('_favicon/')` para obtener los favicons de cualquier sitio web que Chrome tenga en cache.

**Por qué lo necesitamos**: Para mostrar el ícono real de cada sitio junto a las pestañas guardadas, en vez de un ícono genérico.

**Qué ve el usuario**: No muestra advertencia visible (si `tabs` ya está declarado).

### Nota sobre permisos y confianza del usuario
Cuantos más permisos pides, menos usuarios instalarán tu extensión. Chrome muestra una pantalla de advertencia con los permisos más sensibles (`tabs` y `bookmarks` en nuestro caso). Por eso es importante solo pedir lo que realmente necesitas.

---

## 5. Publicación automática con GitHub Actions

### El problema
Sin automatización, cada actualización requiere: build → crear ZIP → subir manualmente al Developer Console. Esto es tedioso y propenso a errores.

### La solución
Un workflow de GitHub Actions (`.github/workflows/publish.yml`) que en cada push a `master`:
1. Instala dependencias
2. Hace build
3. Crea el ZIP
4. Lo sube a Chrome Web Store usando la API
5. Publica automáticamente

### Credenciales necesarias

Para que GitHub Actions pueda subir a Chrome Web Store, necesita autenticarse con la API de Google. Esto requiere OAuth 2.0.

#### ¿Qué es OAuth 2.0?
Es un protocolo de autorización. En vez de darle tu contraseña de Google a GitHub, le das un "token" con permisos limitados (solo puede subir extensiones, nada más). Si algún día quieres revocar el acceso, invalidas el token sin cambiar tu contraseña.

#### Los 4 secrets en GitHub

| Secret | Qué es | De dónde sale |
|---|---|---|
| `CHROME_CLIENT_ID` | Identifica tu "aplicación" ante Google | Google Cloud Console > Credentials |
| `CHROME_CLIENT_SECRET` | La "contraseña" de tu aplicación | Google Cloud Console > Credentials |
| `CHROME_REFRESH_TOKEN` | Token de larga duración que permite obtener access tokens sin interacción humana | Se obtiene una vez con el flujo OAuth (curl) |
| `CHROME_EXTENSION_ID` | El ID único de tu extensión en Chrome Web Store | La URL del Developer Console |

#### Flujo de autenticación (lo que hicimos paso a paso)

```
1. Creamos un "proyecto" en Google Cloud Console
   → Es un contenedor para credenciales y APIs

2. Habilitamos la Chrome Web Store API
   → Le decimos a Google que nuestro proyecto quiere usar esa API

3. Creamos credenciales OAuth (Client ID + Secret)
   → Google nos da una "identidad" para nuestra app de CI

4. Configuramos el OAuth consent screen
   → La pantalla que ves cuando una app pide "¿Permitir acceso?"
   → La pusimos en modo "Testing" (solo para nosotros)

5. Obtuvimos un authorization code
   → Abrimos una URL en el navegador, autorizamos, y Google nos dio un código temporal

6. Intercambiamos el código por un refresh token (curl)
   → El código temporal se cambió por un token de larga duración
   → Este refresh token es lo que GitHub Actions usa para autenticarse

7. Guardamos todo como secrets en GitHub
   → GitHub los inyecta como variables de entorno durante el workflow
```

#### ¿Por qué tantos pasos?
Seguridad. Google no permite que des una API key simple para publicar extensiones (podría ser robada fácilmente). OAuth 2.0 asegura que:
- Tú autorizaste explícitamente (paso 5)
- Los permisos son limitados (solo `chromewebstore` scope)
- Se puede revocar sin cambiar tu contraseña
- Los tokens se guardan encriptados en GitHub Secrets

#### Limitación actual
El refresh token expira en 7 días porque el OAuth consent screen está en modo "Testing". Para hacerlo permanente habría que "publicar" el consent screen en Google Cloud (no la extensión, sino la pantalla de consentimiento). Esto no requiere verificación si solo lo usas tú.

---

## 6. Screenshots automatizadas con Playwright

Para las screenshots del Chrome Web Store, creamos un script de Playwright que:

1. Lanza Chromium con la extensión cargada (`--load-extension`)
2. Inyecta datos reales en `chrome.storage.local` desde un archivo de export
3. Navega por las 3 vistas y el Settings dialog
4. Toma screenshots de 1280x800

El script está en `/tmp/tabclue-screenshots/screenshot.mjs`. Se puede re-ejecutar cada vez que cambie la UI para actualizar las screenshots.

---

## 7. Conceptos clave

### Manifest V3 (MV3)
La versión actual del formato de extensiones de Chrome. Reemplazó a MV2 en 2023. Diferencias principales:
- El background script es un **Service Worker** (no una página persistente)
- Más restricciones de seguridad
- APIs diferentes (ej: `_favicon` en vez de `chrome://favicon2`)

### Service Worker
Un script que corre en segundo plano sin UI. En extensiones MV3, reemplaza a las "background pages" de MV2. Se activa cuando hay eventos (click en ícono, mensaje, etc.) y se duerme cuando no hay actividad. Esto ahorra memoria.

### chrome.storage.local vs localStorage
- `localStorage`: Solo accesible desde una página específica. Se borra al limpiar datos del sitio. Límite de ~5 MB.
- `chrome.storage.local`: Accesible desde cualquier parte de la extensión (background, popup, options). Solo se borra al desinstalar. Con `unlimitedStorage`, sin límite práctico.

### WXT
Framework que simplifica el desarrollo de extensiones. Maneja la configuración de Vite, hot reload, y la estructura del proyecto. Similar a lo que Next.js es para React, pero para extensiones de navegador.

### Favicon en MV3
En MV2 se usaba `chrome://favicon/url`. En MV3 esto no funciona. La forma correcta es:
```javascript
const faviconUrl = chrome.runtime.getURL('_favicon/') + '?pageUrl=' + encodeURIComponent(url) + '&size=32';
```
Requiere el permiso `favicon` en el manifest.

### GitHub Secrets
Variables encriptadas que se configuran en el repo. GitHub las inyecta como variables de entorno durante los workflows. Nadie puede verlas después de crearlas (ni tú). Si necesitas cambiar un valor, tienes que reemplazarlo completo.

---

## 8. Archivos relevantes

| Archivo | Propósito |
|---|---|
| `wxt.config.ts` | Configuración del manifest (permisos, comandos) |
| `.github/workflows/publish.yml` | Workflow de publicación automática |
| `PRIVACY.md` | Política de privacidad pública |
| `src/types/settings.ts` | Modelo de configuración del usuario |
| `src/storage/` | Capa de persistencia con WXT storage |
| `src/entrypoints/background/index.ts` | Service worker (save, close tabs) |
| `src/entrypoints/options/App.tsx` | Dashboard principal |

---

## 9. Qué hacer si...

### ...necesito actualizar la extensión
Solo haz push a `master`. GitHub Actions se encarga del resto.

### ...el workflow falla con ITEM_NOT_UPDATABLE
La extensión está en revisión por Google. Espera a que la aprueben.

### ...el refresh token expira
Repite el paso de autorización (abrir URL en navegador → obtener código → curl → actualizar el secret en GitHub).

### ...quiero agregar un nuevo permiso
1. Agrégalo en `wxt.config.ts`
2. Agrega la justificación en el Developer Console (Privacy practices)
3. Push a master
4. Google puede pedir re-revisión por el nuevo permiso

### ...pierdo mis datos
Usa Import en Settings para restaurar desde un archivo de export. Por eso es importante exportar regularmente.

### ...quiero publicar otra extensión (ej: Request Catcher)
Reutiliza `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET` y `CHROME_REFRESH_TOKEN`. Solo necesitas un `CHROME_EXTENSION_ID` diferente.
