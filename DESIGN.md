# Legado Barber Club — sistema de diseño

## Marca
- Logo: `img/logo-blanco.png` (sobre negro) y `img/logo.jpg` (original negro sobre blanco, solo favicon).
- Paleta: solo blanco y negro con grises neutros. Sin degradados, sin vidrio, sin colores de acento.

| Variable | Valor | Uso |
|---|---|---|
| `--negro` | `#0b0b0b` | Texto, botones primarios, bloques de color |
| `--blanco` | `#ffffff` | Fondo |
| `--gris-50` | `#f5f5f4` | Fondos de apoyo, campos |
| `--gris-200` | `#e4e4e2` | Separadores estructurales, bordes de campos |
| `--gris-500` | `#6b6b69` | Texto secundario sobre blanco (contraste 5.3:1) |
| `--gris-400-oscuro` | `#a3a3a1` | Texto secundario sobre negro (contraste 7.9:1) |

## Tipografía
Una sola familia: **Inter** (400, 500, 600, 700). Jerarquía por tamaño y peso:

| Nivel | Tamaño | Peso |
|---|---|---|
| Titular de portada | 44–88 px | 700, interletra −0.035em |
| Título de sección | 34–56 px | 700, interletra −0.03em |
| Subtítulo | 20–24 px | 600 |
| Texto | 17 px | 400, interlineado 1.6 |
| Apoyo | 14 px | 500 |

Sin etiquetas en mayúsculas sobre los títulos, sin números decorativos, sin palabras resaltadas en otro color.

## Forma
- Radios: `--r-sm` 10px (campos y chips), `--r-md` 16px (fotos y paneles), botones 12px.
- Sombras: ninguna, salvo lo que flota de verdad (no hay nada flotante hoy).
- Separadores: solo líneas finas estructurales (filas de la lista de servicios y del horario).
- Íconos: un único set dibujado a línea, trazo 1.75px, en la barra inferior del celular.

## Movimiento
Un único momento: la pantalla de ingreso (aparición del logo y salida hacia arriba). El resto, solo respuesta al tocar (150–200 ms). Se respeta "reducir movimiento".

## Usabilidad
- Zonas táctiles de 44 px o más; campos de 16 px o más (sin zoom en iPhone).
- En el celular, barra inferior tipo app con 4 destinos: Inicio, Servicios, Reservar, Ubicación.
- Reserva en página propia (`reservar.html`), en 3 pasos, con franjas de una hora (14:00 – 15:00…) y resumen siempre visible, errores junto al campo y confirmación con opción de agregar al calendario.
