# ⚠️ DEPRECADO — Instrucciones de Bloque: columns
> Estado: **OBSOLETO** desde confirmación humana (Decisión 2)
> Sustituido por: [`feature-columns-instructions.md`](./feature-columns-instructions.md)

---

## Aviso de sustitución

Este archivo describía el uso del core `columns` para cuatro secciones de dos columnas de la landing
de Bankinter Luxembourg. Tras confirmación humana, esas secciones se implementan ahora con un **bloque
nuevo y propio** llamado **`feature-columns`**.

**No uses este documento para implementar.** Toda la especificación vigente (modelo
`container`+`items`, campos editables del panel, control de orientación por `layout`, DOM entrada/salida,
responsive, accesibilidad e imágenes) está en:

➡️ **[feature-columns-instructions.md](./feature-columns-instructions.md)**

### Mapeo de secciones (referencia histórica)

| Sección | Nodo desktop | Ahora cubierto por |
|---|---|---|
| Seguridad / Con el servicio | `1:306` | `feature-columns` (layout `equal`) |
| ¿Por qué Luxemburgo? | `1:352` | `feature-columns` (layout `media-content`) |
| ¿Por qué Bankinter Luxemburgo? | `1:370` | `feature-columns` (layout `content-media`) |
| Somos una referencia | `1:407` | `feature-columns` (layout `media-content`) |

> El archivo se conserva (no se elimina) únicamente como redirección para no romper enlaces previos.
