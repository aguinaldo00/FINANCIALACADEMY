# Infografías del Tema 1: diagnóstico y tres direcciones artísticas

**Decisión (11/10):** el usuario eligió **A · Calcografía** como dirección principal, con una condición: una versión más
contemporánea, luminosa y rica en color que el boceto, no un grabado verde de un solo tono. La primera lámina real es la
del ICO (`src/ui/infografias/ico.ts`, `src/ui/infografias/calcografia.ts`, `src/styles/calcografia.css`); las otras 11
siguen con el dibujo genérico hasta que se apruebe esta.

Lo que sigue es el análisis y las tres propuestas que se presentaron (bocetos estáticos, sin código).

## 1. Por qué no funcionan las 12 actuales
| Problema | Dónde | Tipo |
|---|---|---|
| Una sola plantilla para los 12 conceptos: nodos redondos + flechas + etiquetas en caja. El FGD (un tope), el SEBC (conjuntos que se contienen) y los seguros (cuatro papeles) se ven iguales | `infographic.ts` | Dis |
| Fondo azul casi negro con cuadrícula de puntos y colores neón ajenos a la paleta (`#4ade80`, `#60a5fa`…): aspecto de panel de control | `infographic.css:5-7`, `ESTILO_FLUJO` | Dis |
| Iconos emoji: estilo ajeno y desigual (🧠 para el BCE, cajero para «Banco privado») | `infografias.ts` | Dis |
| Lo que no está en el paso se apaga al 18 % y las etiquetas pasadas al 35 %: textos ilegibles | `.ig-actor{opacity:.18}` | Dis/Ped |
| Etiquetas en cajas sobre las flechas; sin punto focal ni jerarquía; tarjeta dentro de tarjeta | `.ig-etq`, `.vis-item` | Dis |
| Cambiar de paso solo cambia opacidades: no hay narración ni cámara | `pintar()` | Dis |
| Dice quién y qué, pero no **por qué** ni **qué cambia**. En el ICO no se explica «se financia en los mercados» (emite bonos), «línea de mediación» ni «riesgo» (quién pierde si la pyme no paga) | contenido | Ped |
| Siglas sin desarrollar dentro de la propia infografía: el ICO nunca dice «Instituto de Crédito Oficial»; tampoco SEPBLAC, FGDEC, CERSA, IIC, SICAV ni SII | contenido | Ped |
| Exactitud: «más de 10 M€» frente a «importe mínimo 10 M€» (ico.es); EFC como «entidades de crédito» (ya no lo son desde la Ley 5/2015); SGR «sus socios son las pymes» (también hay socios protectores); en la vía 3 no se dice que el riesgo lo asume el Estado | `infografias.ts:34,112`, `:87` | Exa (permiso) |

## 2. Qué funciona en el Tema 2, el «día», como listón de calidad
| Recurso | Ejemplo | Por qué funciona |
|---|---|---|
| Un objeto por concepto | el cubo es el capital; la planta, el rendimiento; las cosechas, los intereses | lo abstracto se vuelve cosa |
| Material y volumen | papel con grano, recortes con borde irregular, caras con sombra | se siente físico, no de pantalla |
| Color con significado | C₀ azul, Cₙ mostaza, i rosa, I verde, n violeta, siempre los mismos | el color enseña |
| Composición aireada | un objeto protagonista y mucho aire | un vistazo basta |
| Texto pegado al dibujo | notas a mano y rótulos junto al objeto | sin leyendas aparte |
| Acumulación | cada paso añade y nada desaparece | se ve la construcción |

**No se copia** el cubo, la planta, la cinta, la cuadrícula ni la paleta. Se copia el **nivel**: una metáfora física por concepto, material, color con significado y una sola idea por plano.

## 3. Día y noche
- **Comparten** las tipografías (Fraunces, Plex, Big Shoulders), el principio de «un color = un significado», el grano y el oficio artesanal, el marfil `#fff3e0`–`#f1ebdf` como color del texto y el oro de la marca.
- **Diferencian** la luz y la relación entre figura y fondo:
  - el día: objetos opacos sobre papel claro, a la luz de una ventana;
  - la noche: la luz sale de las cosas (ventanas, cintas, tintas) sobre fondos profundos que **no** son azul marino (verde billete, ciruela, índigo).

## 4. Las tres direcciones

### A · Calcografía: el lenguaje de los billetes
- **Concepto.** El sistema financiero es lo que hay detrás del dinero, y el billete es el objeto donde ese mundo se imprime. Grabado a buril, rosetas de guilloché, viñetas ovaladas, cupones con trepado y tintas de seguridad.
- **Por qué para el sistema español.** Es institucional y legal, como las propias entidades, y cada infografía parece un título o un billete de la serie «Tema 1».
- **El ICO:**
  - el ICO es un medallón cuya roseta tiene dos tintas: cobre arriba (banco público) y violeta abajo (agencia del Estado);
  - los Mercados y el Estado son viñetas grabadas;
  - el dinero viaja en una cinta de líneas onduladas;
  - el «bono ICO» lleva la **marca de agua del Estado**: es la garantía explícita;
  - cada vía es un **cupón** numerado;
  - el riesgo es una **sobreimpresión en bermellón** sobre quien lo asume (el banco, el ICO); en la vía 3, un contorno vacío.
- **Animación:**
  1. Las viñetas se graban línea a línea, la cinta lleva el cobre y aparece la marca de agua.
  2. Se despega el cupón 1 y la tinta roja cae sobre el banco.
  3. Se despega el cupón 2 y el rojo cae sobre el emblema del ICO.
  4. La tinta violeta cruza desde el Estado por la mitad baja del medallón; el contorno del riesgo queda vacío.
  5. Se encienden juntas las tres marcas de riesgo.
- **Paleta.** Plancha `#0a1d18`, grabado `#d6e7cf`, cobre `#e6a95c`, agua `#7fdac6`, violeta `#b29cff`, bermellón `#ff5b3d`.
  - Con el Tema 2 comparte el violeta (n) y el oro (Cₙ → cobre).
  - Invierte figura y fondo, y del recorte pasa al grabado.
- **Variedad entre las 12.** El FGD sería un billete de 100.000 € con el resto, hasta 150.000 €, sin imprimir. El SEBC, rosetas concéntricas. Los seguros, una póliza con cuatro firmas.
- **Riesgos.** Es la más oscura de las tres (tú criticaste lo oscuro) y la más fácil de volver repetitiva. El guilloché pesa en móvil si no se simplifica.

### B · Maqueta al anochecer: volumen y luz
- **Concepto.** Una ciudad en miniatura, como la maqueta de un arquitecto, en la hora azul:
  - cada institución es un edificio con arquitectura propia;
  - el dinero es tráfico de luz por las calles;
  - el riesgo es un **lastre** con baliza roja que se posa en el tejado de quien lo asume.
- **Por qué.** Enlaza con la Ciudad del Dinero en 3D, que ya es el mundo del Tema 1: las infografías serían sus barrios vistos de cerca.
- **El ICO:**
  - la torre del ICO tiene dos fachadas: ámbar del banco público, menta de la agencia;
  - un cable de luz lleva bonos a los Mercados y trae el dinero de vuelta, bajo una cúpula violeta del Estado (la garantía);
  - tres calles: ámbar al banco y la pyme, coral a la obra con grúa y menta desde el palacio del Estado, pasando por el ICO, a la casa, el puerto y los brotes;
  - los rótulos de cada vía, con quién asume el riesgo, se agrupan en el margen, como las placas de una maqueta.
- **Animación:** la cámara (isométrica) se acerca a cada barrio, las calles se encienden con tráfico de luz y una grúa posa el lastre.
  1. El cable y los bonos.
  2. La calle ámbar; el lastre sobre el banco.
  3. La calle coral; el lastre sobre el ICO.
  4. La calle menta; el hueco tachado en el ICO.
  5. La cámara sube y se ve la ciudad entera con sus dos lastres.
- **Paleta.** Cielo `#2b1a40`, horizonte `#8c3d55`, ámbar `#ffb547`, coral `#ff6f7d`, menta `#62f0c0`, lila `#bda3ff`.
  - Son los **mismos tonos del Tema 2** (amarillo, rosa, verde, violeta) convertidos en luces de noche. Es la relación día/noche más clara de las tres.
- **Variedad entre las 12.** El FGD, una cámara acorazada en corte con un paraguas de 100.000 €. El SEBC, plazas concéntricas. Los supervisores, tres barrios con su farola.
- **Riesgos.** Puede parecer un videojuego de construir ciudades si se descuida (materiales mates, nada de HUD). Es la más costosa de dibujar, y los rótulos en móvil necesitan otra disposición.

### C · Contraluz: teatro de sombras
- **Concepto.** Capas de papel recortado iluminadas **por detrás** con luces de color. **El riesgo es una sombra**: una pesa colgada de un hilo proyecta su sombra sobre quien lo asume.
- **Por qué.** «Quién asume el riesgo» es la pregunta de la mitad de las infografías (ICO, SGR, FGD, seguros, MUS y MUR), y la sombra la responde de un vistazo. La profundidad de las capas (lejos, medio, cerca) también ordena: en el ICO, la vía 1 queda al fondo, la 2 en medio y la 3 en primer plano.
- **El ICO:**
  - el ICO es una linterna: ventanas ámbar arriba (banco público) y cian abajo (agencia);
  - el Estado es un palacio de luz lila que lanza un haz sobre los bonos que salen hacia las torres de los Mercados;
  - las tres vías son cintas de papel translúcido;
  - la sombra de la pesa cae sobre el banco y luego sobre el ICO;
  - la vía 3 «no tiene sombra».
- **Animación:**
  1. Se encienden las luces de fondo y las capas entran con paralaje; vuelan los bonos.
  2. La cinta ámbar se desenrolla hacia el fondo; baja la pesa y su sombra cubre el banco.
  3. La cinta coral; la sombra cubre parte del ICO.
  4. La cinta cian en primer plano; la linterna del ICO queda limpia.
  5. Un foco recorre las tres vías.
- **Paleta.** Índigo `#1b1446`, ciruela `#120a1a`, ámbar `#ffa53d`, cian `#46d6e6`, coral `#ff6f91`, lila `#d59bff`.
  - Comparte con el Tema 2 el oficio del papel recortado y el marfil.
  - Cambia la luz: el día es papel visto de frente; la noche, papel a contraluz.
- **Variedad entre las 12.** El FGD, un paraguas recortado que da sombra hasta los 100.000 €, mientras el resto se moja. El SEBC, tres círculos de luz superpuestos. El MUS, un faro, y el MUR, la brigada que entra cuando hay incendio.
- **Riesgos.** Es la más cercana al Tema 2 (papel): para no copiarlo, nada de cinta, cuadrícula ni relleno texturizado; solo siluetas y luz. El texto sobre los halos necesita contorno. Puede parecer un cuento infantil si se abusa de las siluetas.

## 5. Cómo entra cualquiera de las tres en la web (sin perder nada)
- **Datos.** Los textos y los pasos siguen en `infografias.ts`. No cambia el contenido salvo lo que apruebes (§1, Exa).
- **Motor.** Cada infografía pasa a ser una escena del motor de animación que ya existe (`Lienzo`, `Escena` y el reproductor): cada paso es un capítulo y el dibujo es una función pura del tiempo. Todo en SVG, sin librerías nuevas y sin WebGL.
- **Lo que se conserva:**
  - Anterior, Siguiente, Reproducir, puntos de paso;
  - texto del paso con `aria-live`;
  - enlace a la ficha;
  - galería `#visual` e infografías dentro de cada concepto.
- **Movimiento reducido:** cada paso se muestra en su estado final, sin desplazamientos.
- **Móvil:** cada infografía tiene una composición vertical propia, con rótulos de 12 px como mínimo.
- **Glosario:**
  - botón de sigla con `popover`, que funciona con teclado, táctil y lector de pantalla;
  - «Ver glosario del Tema 1».

  Así se ve en los tres bocetos con «riesgo (de crédito)».
- **Prueba en una sola infografía.** Primero el ICO, en la galería real, con capturas en escritorio y en móvil, grabación fotograma a fotograma y movimiento reducido. Solo después las otras 11.

## 6. Recomendación
**C · Contraluz**, con dos préstamos de las otras:
- de A, la idea de que algunas infografías sean un **documento** (la póliza o el bono) cuando el concepto es un contrato;
- de B, la **cámara** que se acerca a cada parte.

Motivos:
- tiene la metáfora más pedagógica (el riesgo como sombra);
- es la que más luz y color aporta sin caer en el azul marino;
- da profundidad real con capas baratas de animar, que funcionan sin WebGL y en móvil;
- forma con el Tema 2 la pareja día/noche más natural: el mismo oficio, iluminado al revés.

**B** es la alternativa si prefieres que el Tema 1 se una a la Ciudad del Dinero en 3D.

## 7. Lo que necesita tu decisión o permiso
1. Elegir A, B o C (o combinarlas).
2. Permiso para corregir en `src/content/` las afirmaciones de exactitud:
   - ICO «mínimo 10 M€»;
   - EFC ya no es entidad de crédito;
   - socios protectores de las SGR;
   - quién asume el riesgo en la vía 3.

   La más grave está fuera de las infografías: «el Banco de España financia a las Administraciones públicas».
3. Permiso para añadir al glosario las explicaciones nuevas (riesgo de crédito, garantía explícita, línea de mediación…).
4. «OMEC» no aparece en ningún texto del proyecto. ¿Dónde lo has visto?
