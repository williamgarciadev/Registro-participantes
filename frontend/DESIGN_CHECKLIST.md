# Design & Accessibility Checklist

## Antes de subir cambios
- [ ] Usa los tokens de `src/styles/tokens.css` para colores, tipografía, bordes y movimiento (nada de hex/px sueltos).
- [ ] Asegura que los componentes comunes (`btn`, `card`, `input`) se reutilizan en lugar de estilos ad-hoc.
- [ ] Verifica contrastes con la extensión o plugin de tu preferencia (mínimo 4.5:1 texto normal, 3:1 texto grande).
- [ ] Recorre la vista con teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`) y confirma foco visible en todos los elementos interactivos.
- [ ] Ejecuta la página con `prefers-reduced-motion` activado y confirma que no hay animaciones bruscas.
- [ ] Revisa textos/microcopy contra la matriz de tono del design guide (lenguaje claro, con acción).
- [ ] Documenta cualquier excepción o override en el PR para mantener el design system alineado.

## Antes de release
- [ ] Corre pruebas de accesibilidad (`npm run lint` + validaciones manuales con screen reader).
- [ ] Captura screenshots clave para regresiones visuales.
- [ ] Valida responsive en 3 breakpoints: 360px, 768px y 1280px.
- [ ] Revalida estados críticos (error, loading, empty) con datos reales o mocks.
