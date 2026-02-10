# <a name="header"></a><a name="content"></a><a name="xa3c1d9622fc4092c0b91e4e18e977dff2310ed0"></a>Plan de Desarrollo Actualizado de DaleFocus
El nuevo **Plan de Desarrollo de DaleFocus** integra los 6 puntos clave acordados, incorporando detalles técnicos y consideraciones adicionales para garantizar un MVP exitoso. A continuación se presenta la planificación estructurada:
## <a name="sección-1-visión-y-arquitectura"></a>Sección 1: Visión y Arquitectura
**Stack Técnico Definido:** La arquitectura de DaleFocus se basa en tecnologías modernas y escalables, divididas en *frontend*, *backend* y *servicios de IA*. Los componentes principales son:

- **Frontend:** Aplicación web en **React 18** (empacada con Vite) utilizando **TailwindCSS** para estilos. Se evitará añadir complejidad con librerías de estado externas en el MVP (no Redux/Zustand); en su lugar se empleará la Context API de React con useReducer para manejo de estado global básico. El despliegue del frontend será en Firebase Hosting para facilidad de integración con el backend.
- **Backend:** Serverless con **Firebase Cloud Functions** (Node.js 20, segunda generación) y **Cloud Firestore** como base de datos en tiempo real. También se usará **Firebase Authentication** para gestionar usuarios. La elección de Cloud Functions Gen2 en región us-central1 proporciona mejor rendimiento y costos moderados. La lógica de negocio (creación de tareas, cálculo de métricas, integración con IA) reside en estas funciones, manteniendo el frontend ligero.
- **Servicios de IA:** Integración de modelos de lenguaje avanzados para las funciones clave:
- **Atomizador IA:** Modelo **GPT-5.1** (versión *gpt-5-2025-08-07*) para desglosar tareas. Se eligió por su alto puntaje de *razonamiento* (4/5) que asegura respuestas estructuradas y coherentes en formato JSON. Además, su costo es optimizado (~$1.25 por 1M tokens de entrada) y permite reutilizar prompts fijos cacheados (reduciendo costo de contexto en ~90%). Se configurará con nivel de esfuerzo de razonamiento "medium" para equilibrar calidad y velocidad de respuesta.
- **IA de Recompensa/Motivación:** Modelo **GPT-5-mini** (versión ligera *gpt-5-mini-2025-08-07*) para generar mensajes motivacionales cortos. Se escogió por su rapidez (4/5 en velocidad) y costo muy bajo ($0.25 por 1M tokens de entrada, $2.00 por 1M tokens de salida, debido a su menor tamaño). Es ideal para respuestas creativas breves que animen al usuario sin incurrir en alto costo.

**Flujo de Datos Principal:** La aplicación sigue una arquitectura orientada a eventos donde el frontend, backend e IA interactúan de forma fluida:

1. El usuario interactúa con la app React para ingresar una tarea y realizar un *check-in emocional* seleccionando su barrera principal.
1. El frontend envía la información de la nueva tarea (título, barrera seleccionada, etc.) a una Cloud Function (POST /atomizeTask) del backend.
1. La Cloud Function ensambla un prompt con los detalles de la tarea y las reglas de atomización (ver Sección 3) y realiza una llamada a la API de **GPT-5.1**. La IA devuelve un plan atomizado en formato JSON (pasos concretos para realizar la tarea).
1. La Cloud Function guarda el resultado en Firestore (documento de **Task** con su lista de **Steps** generados). También puede devolver el JSON directamente al cliente si se requiere respuesta inmediata.
1. El frontend, suscrito a los cambios de Firestore (via onSnapshot o consultas periódicas), recibe la lista de pasos generados y los muestra al usuario en la interfaz.
1. El usuario inicia un **Pomodoro** para el primer paso. El temporizador (implementado en el frontend) registra sesiones de concentración. Al completar o abandonar una sesión, el frontend invoca otra Cloud Function (POST /completeSession) para registrar la sesión en Firestore (colección **sessions**).
1. Tras completar una sesión o un conjunto de pasos, el sistema puede llamar a la función (POST /generateReward) que usa **GPT-5-mini** para generar un mensaje de recompensa o consejo motivacional personalizado según la personalidad elegida del usuario. Este mensaje se muestra en la UI.
1. El **Dashboard** de métricas consulta los datos (vía Firestore directamente o mediante una función GET /getUserMetrics) para calcular el Índice de Enfoque, Time-to-Action, etc. (ver Sección 5). La UI presenta estas métricas y gráficos de progreso al usuario.
1. Opcionalmente, se podrían incorporar notificaciones o actualizaciones en tiempo real a medida que se completan tareas o pomodoros, utilizando la naturaleza tiempo-real de Firestore.

Este diseño **serverless** minimiza la necesidad de gestionar infraestructura dedicada. La comunicación entre frontend y backend es vía HTTPS (Firebase Functions endpoints) y suscripciones a Firestore. El almacenamiento de datos en Firestore permite sincronización inmediata entre dispositivos y persistencia automática.

**Principales Endpoints (Cloud Functions):** Para soportar la lógica descrita, se definieron varios endpoints HTTP en Firebase Functions:

- POST /atomizeTask – Recibe el título de la tarea y la barrera del usuario. Llama a GPT-5.1 para generar los pasos atomizados y guarda la nueva **Task** y sus **Steps** en Firestore. Devuelve el resultado JSON (opcionalmente).
- POST /completeSession – Registra el fin de una sesión de pomodoro. Recibe datos como taskId, stepId (si se estaba trabajando un paso específico), y marca en Firestore la sesión (duración, completada o no). Actualiza contadores de pasos completados y pomodoros.
- POST /generateReward – (Opcional en MVP) Envía el contexto de la sesión recién completada a GPT-5-mini para obtener un mensaje de motivación. Incluye la *personalidad* del usuario para el tono. Devuelve y/o guarda el mensaje de recompensa para mostrarlo.
- GET /getUserMetrics – Calcula o recupera de Firestore las métricas agregadas del usuario (Focus Index, Time-to-Action promedio, Momentum, distribución de barreras) para construir el dashboard. Puede compilar datos de la colección **metrics** (ver Sección 5) o calcular en tiempo real.

**Seguridad y Control de Acceso:** Se implementarán **reglas de seguridad de Firestore** estrictas: cada usuario solo puede leer/escribir sus propios documentos (las colecciones tasks, steps, sessions y métricas estarán protegidas filtrando por userId == request.auth.uid). Asimismo, los Cloud Functions validarán la entrada (por ejemplo, que taskTitle no esté vacío, barrier sea una de las 4 categorías permitidas, etc.) y aplicarán **rate limiting** básico para evitar abuso de la API de IA (ejemplo: limitar a 5 atomizaciones por minuto por usuario, para controlar costos). Estas medidas aseguran que datos privados estén protegidos y que el uso de la IA se mantenga dentro de límites aceptables.
## <a name="sección-2-funcionalidades-mvp-y-post-mvp"></a>Sección 2: Funcionalidades MVP (y Post-MVP)
En esta sección se detallan las funcionalidades que formarán parte del **MVP** de DaleFocus, diferenciándolas de aquellas reservadas para etapas posteriores (Post-MVP). Cada funcionalidad MVP incluye una breve descripción técnica y consideraciones de implementación.

**Funcionalidades incluidas en el MVP:**

- **Check-in Emocional Simplificado:** Al iniciar una sesión de enfoque, el usuario indica cómo se siente ante la tarea eligiendo una de las 4 barreras predefinidas (overwhelmed = "abrumado", uncertain = "incierto/no sé por dónde empezar", bored = "perezoso/aburrido", perfectionism = "perfeccionismo"). Esto se implementa como una pantalla o modal inicial con botones para cada estado emocional (sin escalas numéricas ni test clínicos, manteniendo la interacción simple). La selección de la barrera alimenta directamente al Atomizador IA para personalizar la estrategia de los pasos. (**MVP**)
- **Atomizador de Tareas con IA:** Esta es la funcionalidad central y el diferenciador principal de DaleFocus. Consiste en tomar la tarea escrita por el usuario (p.ej., "Preparar presentación de ventas") junto con la barrera indicada, y utilizar la **IA GPT-5.1** para generar un plan *paso a paso* altamente específico y accionable. El resultado es un JSON estructurado con pasos atómicos, cada uno con un tiempo estimado (generalmente en minutos), criterios de éxito y un orden lógico (ver Sección 3 para detalles del formato). Esta funcionalidad requiere la integración con la API de IA vía Cloud Function (/atomizeTask). Es esencial para el MVP, ya que convierte la experiencia tradicional de lista de tareas en un plan dinámico personalizado. (**MVP**)
- **Temporizador Pomodoro Integrado:** Se incorporará un temporizador Pomodoro en la aplicación, utilizando la técnica 25/5 (25 minutos de trabajo, 5 de descanso corto, con descanso largo de 15 minutos cada 4 ciclos, parámetros configurables). El temporizador estará ligado a los pasos generados: el usuario puede iniciar un Pomodoro en un paso específico o en modo libre. Durante una sesión, la interfaz mostrará el tiempo restante y permitirá pausar o cancelar. Al finalizar, se registra automáticamente una **sesión** en Firestore (con timestamp de inicio/fin, duración real, paso asociado si aplica, etc.). Esto se implementa en el frontend (JS timers) y coordina con el backend via completeSession para persistencia. (**MVP**)
- **Feedback y Recompensas Personalizadas (IA):** Después de completar un Pomodoro o finalizar un paso/tarea, el sistema brindará un **mensaje motivacional** o de recompensa generado por IA (GPT-5-mini). El contenido y tono de este mensaje se adaptan a la **personalidad** elegida por el usuario en su perfil. Por ejemplo, un usuario con personalidad "Meme-Lord" podría recibir un mensaje gracioso tipo *"¡Plot twist!: terminaste antes que un video de TikTok 🚀"* mientras que alguien con personalidad "Sargento" obtendría algo más directo como *"Tiempo cumplido. ¡Buen trabajo, soldado!"*. Esta característica añade un elemento lúdico y de refuerzo positivo inmediato tras la acción. Técnicamente, se invoca la función /generateReward con los datos necesarios (p. ej., qué se logró y la personalidad) y la respuesta de la IA se muestra en la UI. (**MVP**)
- **Dashboard de Enfoque (Métricas Clave):** Se proveerá al usuario un panel con **métricas** de productividad y comportamiento, para fomentar la autorreflexión y la mejora continua. Las tres métricas estrella a mostrar son:
- *Índice de Enfoque (Focus Index):* promedio de pomodoros utilizados por tarea completada (una medida de cuánta concentración requiere en promedio una tarea para esa persona).
- *Time-to-Action:* tiempo promedio (en minutos) que el usuario tarda en empezar efectivamente a trabajar en una tarea desde que la crea/planifica.
- *Momentum:* porcentaje de pasos completados vs. pasos planificados (indica la consistencia en terminar lo que se empieza).

Además, el dashboard muestra la frecuencia de cada tipo de barrera reportada en la última semana (ejemplo: 🤯 **Abrumado:** 8 veces, 🤔 **Incertidumbre:** 4, 😴 **Pereza:** 6, 😰 **Perfeccionismo:** 2). Esto ayuda al usuario a reconocer patrones emocionales que afectan su productividad. La implementación técnica consulta la colección de métricas diarias en Firestore (ver Sección 5) y compone visualizaciones (gráficos de barras, etc.) en el frontend. (**MVP**)

- **Gestor de Tareas y Pasos:** La aplicación permitirá crear nuevas tareas, ver la lista de pasos generados por el Atomizador y marcar pasos como completados. Cada tarea mostrará su progreso (e.g., X de Y pasos completados, tiempo estimado vs real invertido, etc.). Los pasos podrán tener checkbox o botones de completar, lo que registrará su finalización (y posiblemente dispare el siguiente paso recomendado). También se puede permitir que el usuario descarte/ignore un paso si no aplica, aunque en el MVP se prioriza seguir la secuencia dada. (**MVP**)
- **Perfil de Usuario y Personalización:** Incluye registro/inicio de sesión (mediante Firebase Auth) y un perfil básico donde el usuario puede definir su *apodo* o nombre, y seleccionar una de las cuatro **personalidades** para los mensajes motivacionales (Coach Pro, Pana Real, Sargento, Meme-Lord). Esta configuración personal se almacena en users/{userId} y se utiliza en las funciones de IA para adaptar el tono del apoyo que brinda la aplicación. (**MVP**)

**Funcionalidades** Post-MVP **(Planeadas para futuras iteraciones):**

- **Características Sociales y Colaborativas:** Permitir interacciones entre usuarios una vez establecida la funcionalidad principal. Ejemplos de post-MVP: agregar amigos o compañeros de responsabilidad (*accountability partners*), compartir el progreso de tareas o pomodoros en una feed, retos grupales semanales (e.g., completar X pomodoros en grupo), o un sistema de soporte social donde usuarios pueden ver las barreras más comunes entre sus colegas y ofrecer ánimo. Estas funciones están fuera del alcance del MVP, ya que la prioridad inicial es la experiencia individual enfocada. (**Post-MVP**)
- **Gamificación Avanzada:** Si bien el MVP incluye elementos motivacionales simples, a futuro se podría introducir un sistema de logros, insignias o puntos por completar tareas/pomodoros, tablas de clasificación, rachas de días productivos, etc. Esto incrementaría el engagement pero requiere análisis cuidadoso para no distraer de la productividad en sí. (**Post-MVP**)
- **Check-in Emocional Enriquecido:** Más adelante, podríamos refinar el *emotional check-in* para capturar matices adicionales. Por ejemplo, permitir que el usuario escriba brevemente cómo se siente o seleccione emociones secundarias, integrar escalas de ánimo o incluso captar datos pasivos (como la hora del día o nivel de actividad) que alimenten el modelo. También se podrían mostrar consejos basados en historial emocional (*"Notamos que frecuentemente te sientes X los lunes. Prueba Y..."*). Esto agrega complejidad y requeriría más validación científica, por lo que queda fuera del MVP. (**Post-MVP**)
- **Mejoras en Personalización con IA:** En versiones futuras, el Atomizador podría aprender de las preferencias del usuario. Por ejemplo, ajustar automáticamente la duración de pasos si detecta que siempre tarda más/menos de lo estimado, o variar las estrategias en función del éxito pasado (un enfoque de ML personalizado). Igualmente, las recomendaciones motivacionales podrían volverse más contextuales (p.ej., mensajes diferentes si es de mañana vs noche, o usando el historial de tareas completadas para dar feedback positivo). Estas mejoras requieren recopilar suficientes datos de uso en MVP y posiblemente entrenar modelos o ajustar prompts dinámicamente. (**Post-MVP**)
- **Aplicación Móvil Nativa:** Si bien el MVP web será **responsive** para usarse en móviles, una aplicación móvil nativa (Android/iOS) podría ser un paso siguiente importante, facilitando notificaciones push (por ejemplo, recordar al usuario iniciar su primer pomodoro del día o animarle cuando suele procrastinar). Esto implicaría un esfuerzo de desarrollo adicional (posiblemente usando React Native o Flutter reutilizando lógica). (**Post-MVP**)

En resumen, el **MVP** de DaleFocus cubrirá toda la experiencia central: desde que el usuario indica su estado emocional y una tarea, hasta que completa la tarea recibiendo apoyo constante de la IA y midiendo su propio desempeño. Las características post-MVP, aunque valiosas, se reservarán para después de validar el MVP y obtener retroalimentación de los usuarios iniciales.
## <a name="sección-3-sistema-de-atomización-con-ia"></a>Sección 3: Sistema de Atomización con IA
El **Atomizador IA** es el núcleo innovador de DaleFocus. Su objetivo es convertir una tarea pendiente, junto con la barrera emocional del usuario, en un plan concreto de acción compuesto por micro-pasos alcanzables. A continuación se detallan el contrato de formato JSON, las estrategias basadas en barreras, y los prompts utilizados para lograr esto:

**Contrato JSON del Plan Atomizado:** La IA (GPT-5.1) devolverá cada plan de tareas en un formato JSON predefinido, asegurando que el frontend pueda interpretarlo fácilmente. Este JSON incluye la información de la tarea, la estrategia aplicada, la lista de pasos con detalles y otros campos auxiliares. Un ejemplo simplificado del formato de salida es el siguiente:

{\
`  `"taskTitle": "Preparar exposición de 10 min",\
`  `"barrier": "overwhelmed",  // Barrera emocional seleccionada por el usuario\
`  `"strategy": "micro\_wins",   // Estrategia elegida por la IA acorde a la barrera\
`  `"goal": "Entregar presentación clara y ensayada",\
`  `"estimatedPomodoros": 6,\
`  `"steps": [\
`    `{\
`      `"id": "s1",\
`      `"title": "Escribe el objetivo en 1 frase",\
`      `"action": "En una línea: ¿qué debe entender la audiencia?",\
`      `"estimateMinutes": 3,\
`      `"acceptanceCriteria": ["Tengo 1 frase escrita"],\
`      `"order": 1\
`    `},\
`    `{\
`      `"id": "s2",\
`      `"title": "Lista 3 puntos clave",\
`      `"action": "En bullet points: ¿cuáles son las 3 ideas principales?",\
`      `"estimateMinutes": 10,\
`      `"acceptanceCriteria": ["Tengo 3 bullets claros"],\
`      `"order": 2\
`    `}\
`    `// ... más pasos según la estrategia seleccionada\
`  `],\
`  `"nextBestActionId": "s1",\
`  `"antiProcrastinationTip": "Solo 3 minutos para el primer paso. ¡Vamos a empezar!"\
}

En el ejemplo anterior, para la tarea *"Preparar exposición de 10 min"* con barrera *"abrumado"* (overwhelmed), la IA optó por la estrategia "micro\_wins" (micro-victorias). Generó pasos muy específicos y cortos (el primero de solo 3 minutos) y proporcionó un **antiProcrastinationTip** motivador inicial.

**Estrategias según la Barrera Emocional:** DaleFocus define 4 barreras típicas de procrastinación, cada una asociada a una estrategia distinta de atomización. Estas estrategias guían a la IA en cómo estructurar los pasos. Las cuatro categorías son:

- **Abrumado (overwhelmed):** Estrategia **micro\_wins**. Se enfoca en obtener pequeñas victorias. La IA divide la tarea en *pasos ultra pequeños* (generalmente de 3 a 10 minutos cada uno). El primer paso debe ser extremadamente corto (≤ 3 minutos) para vencer la parálisis inicial. Las instrucciones de cada paso son muy específicas y concretas (por ejemplo, "Escribe X" en lugar de "Piensa en X"), y los criterios de aceptación son mínimos pero tangibles. Esto ayuda a que alguien abrumado recobre el sentido de progreso rápidamente.
- **Incertidumbre / No sé por dónde empezar (uncertain):** Estrategia **structured\_exploration**. Orientada a quienes se sienten perdidos ante una tarea. La IA comenzará siempre con un paso de *exploración estructurada*, por ejemplo "Investiga referencias sobre [tema] durante 15 minutos", para que el usuario se empape del contexto. El segundo paso suele ser "Define una estructura basándote en lo explorado". Los primeros pasos evitan que el usuario tome decisiones irreversibles; más bien recopilan información y delinean un plan antes de ejecutar. Esto da claridad y un punto de partida sólido.
- **Pereza o Aburrimiento (bored):** Estrategia **quick\_momentum**. Pensada para quien procrastina por falta de motivación o interés. La IA propone un **primer paso trivialmente fácil** (alrededor de 2 minutos, por ejemplo "Abre el documento y escribe el título") para que el usuario arranque sin sentir resistencia. El segundo paso ya implica un poco más de esfuerzo (15-20 minutos) aprovechando el ímpetu inicial. El lenguaje de las acciones es enérgico e informal, usando frases motivadoras como "¡Dale, comienza con...!" o "Arranca por...". La idea es generar dinamismo y hacer que el usuario sienta progreso rápidamente para vencer la pereza.
- **Perfeccionismo (perfectionism):** Estrategia **good\_enough\_iterations**. Para usuarios que posponen por buscar resultados perfectos. La IA enfatiza que avanzar es mejor que estancarse afinando detalles. Los criterios de aceptación de los pasos especifican obtener una "*primera versión*" o un "*borrador suficiente*" en lugar de la perfección. Se evitan términos absolutos como "perfecto/definitivo". Por ejemplo, en lugar de "Escribe la versión final de la introducción", un paso sería "Escribe un borrador rápido de la introducción (aunque no sea perfecto)". Además, típicamente el último paso sugiere una iteración de mejora opcional ("Si queda tiempo, repasa y pule X"), dejando claro que pulir es secundario. Esto libera al usuario de la trampa de la perfección.

Estas reglas de atomización están **pre-definidas en el prompt del sistema** que se envía a GPT-5.1, de modo que la IA siga un guión coherente según el estado emocional del usuario. La IA también asigna el campo "strategy" en el JSON (como "micro\_wins", "structured\_exploration", etc.) para registrar cuál estrategia se aplicó, lo cual podría usarse para analítica o ajuste futuro del modelo.

**Prompt de Atomización (IA GPT-5.1):** Para obtener el JSON deseado, se diseñó un prompt detallado que se envía a la IA. Este prompt le indica a GPT-5.1 su papel y las reglas anteriores. Por ejemplo, un fragmento simplificado del **prompt base** es:

Eres un asistente experto en combatir la procrastinación mediante atomización inteligente de tareas.\
\
CONTEXTO DEL USUARIO:\
\- Tarea: {taskTitle}\
\- Barrera principal: {barrier}\
\- Tiempo disponible estimado: {availableHours} horas\
\
REGLAS DE ATOMIZACIÓN según barrera:\
\
Si barrier === "overwhelmed":\
\- Crea pasos de máximo 10 minutos cada uno.\
\- El primer paso debe tomar ≤ 3 minutos.\
\- Usa lenguaje ultra específico ("Escribe X", no "Piensa en X").\
\- Criterios de aceptación tangibles y mínimos.\
\
Si barrier === "uncertain":\
\- El primer paso es siempre una exploración de 15 min (investigar, leer, etc.).\
\- El segundo paso: definir estructura basándose en lo investigado.\
\- Evita decisiones importantes en los primeros 2 pasos.\
\
Si barrier === "bored":\
\- El primer paso debe ser muy fácil y corto (~2 min) para iniciar.\
\- El segundo paso puede ser más sustancioso (15-20 min).\
\- Usa tono energético y coloquial ("Dale, comienza por...").\
\
Si barrier === "perfectionism":\
\- Siempre indica que el resultado puede ser un borrador o versión 1 (evitar perfección).\
\- Prohibido usar palabras como "perfecto", "definitivo".\
\- El último paso puede ser "pulir o iterar" (opcional si hay tiempo).\
\
OUTPUT FORMAT (JSON) ESTRICTO:\
{\
`  `"taskTitle": string,\
`  `"barrier": "overwhelmed" | "uncertain" | "bored" | "perfectionism",\
`  `"strategy": string,\
`  `"estimatedPomodoros": number,\
`  `"steps": [ ... ],\
`  `"nextBestActionId": string,\
`  `"antiProcrastinationTip": string\
}\
\
PERSONALIDAD DEL MENSAJE MOTIVACIONAL:\
El tip anti-procrastinación debe adaptarse a la personalidad del usuario:\
\- "Coach Pro": Profesional y motivador (ej: "Este primer paso es clave. Tómate 3 minutos para hacerlo.").\
\- "Pana Real": Cercano y coloquial (ej: "Dale, pana. Son solo 3 minutos, ¿arrancamos?").\
\- "Sargento": Estilo militar, estricto (ej: "3 minutos. Ahora. Sin excusas. ¡A darle!").\
\- "Meme-Lord": Humorístico y relajado (ej: "Plot twist: este paso te tomará menos que un TikTok 🚀").\
\
Genera ahora el plan atomizado en formato JSON según las reglas y contexto provistos.

En este prompt, {taskTitle}, {barrier}, {availableHours} y {personality} se reemplazarían con los valores reales de la tarea del usuario, la barrera seleccionada, el tiempo disponible (si el usuario lo especifica, por defecto unas 4 horas para la sesión típica) y la personalidad elegida para el tip motivacional. Las **reglas de atomización** para cada barrera garantizan que la respuesta de la IA esté adaptada al estado emocional. También se define claramente el formato de salida JSON que la IA debe seguir, para que el resultado sea fácilmente parseable.

Cabe destacar que usamos el **mismo prompt de sistema fijo** para todas las solicitudes de atomización, cambiando solo el contenido específico del usuario en cada caso. Gracias a esta consistencia, podemos aprovechar una técnica de **caché de prompt**: la parte fija (todas las instrucciones y ejemplos que no cambian) se puede reutilizar en múltiples llamadas, de forma que GPT-5.1 no tenga que procesar esos tokens repetidamente, reduciendo significativamente los costos. En la práctica, esto implica enviar a la API un contexto ya pre-cargado con las instrucciones generales, y anexar únicamente los detalles de la tarea actual. Según nuestras estimaciones, esta optimización puede recortar ~90% de los tokens de entrada por llamada tras la primera, lo que es muy beneficioso dado el modelo de tarificación por token.

**Costos de IA y Optimización:** Con las elecciones de modelo mencionadas, el costo de las integraciones de IA resulta manejable en el MVP: - *GPT-5.1:* Coste aproximado de $1.25 por 1 millón de tokens de entrada (y tarifas similares por tokens de salida). Dado que cada atomización de tarea podría consumir del orden de unos pocos cientos de tokens (gracias a la reutilización del prompt fijo, solo varían el título de tarea y unos pocos datos), el costo por tarea planificada es del orden de **milésimas de dólar** (ej: ~$0.001 por tarea atomizada). Esto significa que incluso **100 tareas atomizadas** apenas costarían ~$0.10-$0.15 en total. Para un grupo de 100 usuarios activos creando una tarea al día, el costo mensual rondaría apenas $3-$5 en llamadas a GPT-5.1, lo cual es bastante asumible para un MVP. - *GPT-5-mini:* Este modelo es aún más barato; generando breves mensajes de recompensa (quizá 50 tokens de salida en promedio) a un costo insignificante. Incluso miles de mensajes mensuales apenas sumarían centavos.

En conjunto, el **gasto en IA** no debería superar unos pocos dólares mensuales en la fase MVP. Aún así, se implementarán **controles** como el mencionado límite de 5 atomizaciones/min por usuario y posiblemente un simple caché de resultados recientes, para evitar llamadas redundantes. Si la base de usuarios crece significativamente, se evaluarán opciones de escalamiento (como afinar más los prompts para reducir tokens, entrenar un modelo propietario más económico con los datos acumulados, o contar con backing off en momentos de alta carga). Por ahora, el enfoque elegido balancea **personalización** y **costo eficiente**.
## <a name="sección-4-modelo-de-datos-firestore"></a>Sección 4: Modelo de Datos (Firestore)
Para sostener las funcionalidades descritas, DaleFocus emplea un modelo de datos centralizado en **Firebase Firestore**, aprovechando su esquema NoSQL orientado a colecciones de documentos. A continuación se describen las colecciones principales, sus campos y relaciones, así como consideraciones de seguridad e indexación:

- **Colección users/{userId} – Perfil de Usuario:** Almacena la información básica del usuario. Campos principales:
- displayName (string): Nombre o alias del usuario.
- personality (string): Tipo de personalidad elegido para los mensajes motivacionales (posibles valores: "Coach Pro", "Pana Real", "Sargento", "Meme-Lord").
- pomodoroConfig (map): Configuración personal de duración de pomodoro y descansos (p.ej., { workMinutes: 25, shortBreak: 5, longBreak: 15, pomodorosUntilLongBreak: 4 } con valores por defecto).
- createdAt (timestamp): Fecha de registro.

Cada documento de usuario tendrá como ID el uid provisto por Firebase Auth. Esta colección puede tener índices por displayName si se buscan usuarios (no imprescindible para MVP ya que no hay interacción social aún).

- **Colección tasks/{taskId} – Tareas:** Contiene las tareas creadas por los usuarios, incluyendo las generadas por la IA:
- userId (string): Referencia al usuario propietario (debe coincidir con la UID autenticada).
- title (string): Título o descripción breve de la tarea.
- barrier (string): Barrera seleccionada en el check-in emocional para esta tarea (overwhelmed, uncertain, bored, perfectionism).
- strategy (string): Estrategia de atomización aplicada (micro\_wins, structured\_exploration, quick\_momentum, good\_enough\_iterations).
- estimatedPomodoros (number): Cantidad estimada de pomodoros para completar la tarea (calculado por la IA sumando las duraciones de pasos, típicamente cada 25 min cuenta como 1).
- status (string): Estado actual de la tarea, e.g. "active" (en progreso), "completed", o "abandoned".
- createdAt (timestamp): Fecha de creación de la tarea.
- completedAt (timestamp, nullable): Fecha de finalización (si status es "completed").

Esta colección estará indexada por userId para obtener fácilmente todas las tareas de un usuario. Los **Steps** relacionados se almacenan en su propia colección para mayor flexibilidad (no anidados directamente, aunque se podría usar subcolección anidada bajo cada tarea, en MVP optamos por colección plana para consultas globales si hiciera falta).

- **Colección steps/{stepId} – Pasos Atomizados:** Cada documento representa un paso específico perteneciente a una tarea:
- taskId (string): Referencia a la tarea padre a la que este paso pertenece.
- title (string): Título o breve enunciado del paso.
- action (string): Descripción de la acción a realizar (imperativo y concreto, generado por la IA).
- estimateMinutes (number): Duración estimada en minutos para completar el paso.
- acceptanceCriteria (array<string>): Lista de criterios de aceptación o resultados que indican que el paso se logró (generalmente uno o dos items breves).
- order (number): Posición/secuencia del paso dentro la tarea (comenzando en 1).
- status (string): Estado actual del paso, inicialmente "pending", luego "in\_progress" cuando se está abordando (por ejemplo, si un pomodoro está asociado a ese paso), y finalmente "completed" cuando se marca como terminado.
- completedAt (timestamp, nullable): Fecha/hora en que se completó el paso (si aplica).

La clave stepId podría ser autogenerada, combinada con taskId o algún identificador legible (p.ej., usar el formato "taskId-s1, s2..." que la IA provee, pero internamente no es necesario). Se crearán índices compuestos si se requiere filtrar pasos por taskId y status simultáneamente (por ejemplo, consultar pasos pendientes de una tarea).

- **Colección sessions/{sessionId} – Sesiones Pomodoro:** Almacena los registros de cada pomodoro realizado:
- userId (string): Referencia al usuario.
- taskId (string): Tarea en la que se estaba trabajando (puede ser null si la sesión no estaba ligada a una tarea específica, p.ej. pomodoro libre).
- stepId (string, nullable): Paso específico durante el cual se hizo la sesión (si el usuario inició el temporizador desde un paso concreto).
- startAt (timestamp): Fecha/hora de inicio de la sesión.
- endAt (timestamp, nullable): Fecha/hora de fin de la sesión (si se completa; null si está en progreso o abandonada).
- durationMinutes (number): Duración en minutos de la sesión (ej. 25 o menor si se detuvo antes).
- completed (boolean): Indica si la sesión terminó normalmente (true) o si se interrumpió/abandonó antes de tiempo (false).
- pausedAt (timestamp, nullable): Si se implementa pausa, hora en que se pausó (en MVP podemos no tener pausa, campo opcional para futuro).

Para métricas, interesa filtrar sesiones completadas vs abandonadas, y calcular tiempos efectivos de enfoque por día. Se indexará por userId y quizás por rango de fechas (startAt) para consultas temporales (Firestore permite índices de campos múltiples, se puede crear uno para userId + date if needed).

- **Colección (o subcolección) metrics/{userId}/daily/{date} – Métricas Diarias:** Estructura diseñada para *agregar* datos relevantes por usuario por día, facilitando el cálculo eficiente de tendencias semanales:
- date (string, formato YYYY-MM-DD): Fecha del día al que corresponden los datos.
- pomodorosCompleted (number): Cantidad de pomodoros completados ese día por el usuario.
- stepsCompleted (number): Número de pasos de tareas marcados como completados ese día.
- tasksCompleted (number): Número de tareas finalizadas ese día.
- timeToFirstPomodoro (number): Minutos que tardó el usuario en comenzar su primer pomodoro del día desde que inició su sesión (login) o desde que creó su primera tarea del día. Esta es una métrica de *Time-to-Action* a nivel diario.
- averageSessionDuration (number): Duración promedio de las sesiones de ese día (para ver si suele agotar los 25 min o corta antes, etc.).
- barriersReported (map): Conteo de cada tipo de barrera seleccionada ese día, por ej: { overwhelmed: 1, uncertain: 0, bored: 1, perfectionism: 0 }.

Estos documentos se podrían generar/actualizar al final de cada día o en tiempo real conforme suceden eventos (aunque para simplicidad, muchas métricas se pueden calcular on-the-fly agregando las colecciones de sessions y steps; sin embargo, consolidar en documentos diarios facilita mostrar históricos sin recalcular demasiado). Firestore permite calcular algunos agregados vía Cloud Functions triggers (por ejemplo, un trigger al completar un pomodoro que incremente pomodorosCompleted del día). **Indices:** probablemente se accede por ruta conocida (metrics/userId/daily) y se listan todos para el rango deseado; un índice por date asc/desc dentro de esa subcolección podría ser útil para ordenar o limitar (Firestore subcolecciones ya permiten ordenar por un campo dentro de ellas).

**Reglas de Seguridad y Privacidad:** Como se mencionó, todas estas colecciones estarán protegidas por reglas de seguridad que validan el userId. Cada lectura o escritura requerirá que request.auth.uid != null (usuario autenticado) y normalmente exigirá resource.data.userId == request.auth.uid (en escritura, que el campo userId del objeto iguale al UID del usuario, y en lectura igual para filtros). De este modo, cada usuario sólo accede a sus tareas, pasos, sesiones y métricas. Asimismo, en Cloud Functions se verificará la autenticación en aquellas que modifiquen datos sensibles. Datos como la estrategia elegida o barrera son relativamente no sensibles, pero igualmente son privados del usuario. No se almacenará información personal delicada; el foco es en datos de productividad. Esto cumple con principios básicos de **privacy by design**.
## <a name="sección-5-métricas-y-analytics"></a>Sección 5: Métricas y Analytics
Las **métricas clave** de DaleFocus sirven para que el usuario entienda y mejore su conducta productiva, pero también son útiles para validar la eficacia de la aplicación. A continuación describimos cada métrica y cómo se calcula:

- **Índice de Enfoque (Focus Index):** Representa la cantidad promedio de pomodoros que el usuario necesita para completar una tarea. Se calcula como:

Focus Index=Total de pomodoros completadosTotal de tareas completadas

(en un período dado, p.ej. últimos 7 días o desde que usa la app). Un Focus Index de, por ejemplo, **4.2** indicaría que en promedio una tarea le toma al usuario unos 4 pomodoros. Este índice refleja el tamaño/desafío típico de las tareas del usuario o su capacidad de concentración mantenida: si baja con el tiempo, podría significar que el usuario está dividiendo mejor sus tareas o mejorando su eficiencia. **Implementación:** se puede calcular rápidamente contando las sesiones en sessions y las tareas marcadas como completadas en tasks. Para el dashboard semanal, una Cloud Function (getUserMetrics) podría agrupar las sesiones y tareas de los últimos 7 días y devolver el promedio, o el cliente podría leer los documentos diarios de metrics/daily y hacer el promedio (suma de pomodoros completados en 7 días dividido entre tareas completadas en 7 días).

- **Time-to-Action (Tiempo hasta la acción):** Mide la rapidez con que el usuario pasa de la planificación a la acción. Específicamente, calculamos el tiempo promedio (en minutos) desde que una tarea es creada hasta que inicia su primer pomodoro asociado a esa tarea. Por ejemplo, si un usuario crea una tarea a las 9:00 y comienza a trabajar en ella (start de pomodoro) a las 9:10, ese caso aporta 10 minutos de TTA. Si otra tarea la empieza apenas 2 minutos después de crearla, aportaría 2, y así sucesivamente. Promediando en varios casos obtendríamos quizás **8 minutos** de Time-to-Action semanal. Un número menor es mejor, pues indica poca procrastinación entre planificar y ejecutar. **Implementación:** cada Task puede tener un campo calculado firstSessionAt (timestamp de la primera sesión iniciada para esa tarea). Al iniciar un pomodoro vía completeSession, si Task.firstSessionAt está vacío, la función lo rellenaría. Luego, TTA = promedio( firstSessionAt - createdAt ) en minutos para tareas recientes. Esto también se puede almacenar en metrics/daily como timeToFirstPomodoro para el primer pomodoro del día o incluso promedio diario. El dashboard mostrará el **Time-to-Action promedio** de la última semana, por ejemplo.
- **Momentum (Ímpetu de completitud):** Es un porcentaje que refleja qué tanto de lo que se comienza se termina. Podemos definirlo como la proporción de pasos completados frente a pasos iniciados (o tareas completadas vs iniciadas) en un período. Para granularidad diaria, podría ser:

Momentum%=pasos completadospasos completados+pasos abandonados×100

donde "paso abandonado" significaría que el usuario dejó de trabajar en un paso (o lo saltó) y pasó a otra cosa sin completarlo. Dado que en el MVP no hay una funcionalidad explícita de "abandonar paso", podríamos inferir abandono si pasan X días sin completar un paso activo, pero eso es complejo. En MVP, simplificaremos el Momentum como **porcentaje de pasos completados de todos los pasos planificados** en la última semana. Por ejemplo, si en la semana el usuario tenía 20 pasos (sumando todas las tareas) y completó 15 de ellos, su Momentum sería **75%**. Esta métrica es más sencilla que intentar medir "regulación emocional" directamente, pero sirve como un indicador de consistencia: valores altos implican que el usuario suele finalizar lo que empieza, mientras que valores bajos indican muchas tareas o pasos inconclusos. **Implementación:** a partir de steps se puede contar pasos completados vs pendientes por usuario y calcular el porcentaje. También registramos en metrics/daily el número de stepsCompleted por día; un Momentum semanal se derivaría de sumas semanales. En una versión futura, podríamos rastrear explícitamente cuando un paso se abandona, pero por ahora asumiremos que todo paso no completado es "pendiente" (no distinguimos abandono vs en progreso prolongado).

Además de estas métricas principales, se recopilan otros datos útiles: - **Frecuencia de Barreras:** Como se mencionó, contamos cuántas veces cada tipo de barrera es reportada por el usuario. Esto permite generar gráficos del estado emocional predominante. Por ejemplo, el dashboard podría mostrar: *"Esta semana te sentiste **Abrumado 8 veces**, **Con incertidumbre 4**, **Con pereza 6**, **Perfeccionista 2**"* junto a emojis/iconos correspondientes. Identificar que, por decir, "Abrumado" es frecuente puede llevar al usuario a aplicar estrategias específicas (y también a nosotros para ofrecer tips en el futuro adaptados a esa tendencia). - **Duración Promedio de Sesión:** Aunque usamos pomodoros de 25 min estándar, en la práctica el usuario podría interrumpir antes alguna sesión. Calcular la duración promedio efectiva ayuda a ver si el usuario tiende a completar los pomodoros o no. Esto se calcula fácilmente de sessions (campos startAt y endAt). - **Tiempo hasta el primer pomodoro del día:** Métrica diaria que ya mencionamos (timeToFirstPomodoro en DailyMetrics): cuántos minutos después de iniciar el día (podemos marcar el login o la creación de la primera tarea) el usuario arranca un pomodoro. Útil para ver si hay procrastinación al iniciar la jornada.

**Visualización y Cálculo:** La mayoría de estas métricas se recalculan dinámicamente o casi en tiempo real. Por ejemplo, cada vez que un usuario completa un paso o tarea, podríamos actualizar un contador diario en Firestore mediante Cloud Function triggers. Alternativamente, el dashboard al abrirse puede lanzar una Cloud Function (/getUserMetrics) que agregue los datos de las colecciones y devuelva las métricas ya calculadas. En términos de carga, los volúmenes son bajos por usuario, así que un cálculo on-the-fly (sumar unas docenas de documentos) es razonable.

Por transparencia con el usuario, las métricas estarán explicadas en la app (p. ej., un ícono de información junto a cada nombre que al pasar el cursor diga "El Índice de Enfoque es la cantidad promedio de pomodoros por tarea completada"). La meta es motivar, no juzgar; por eso evitamos por ahora métricas negativas o demasiado complejas. En pruebas de usuario, validaremos que estas métricas efectivamente les resulten útiles para mejorar sus hábitos.
## <a name="x8c57b910b5818ba4d33fde384374bfe30cda0f7"></a>Sección 6: Roadmap de Implementación (9–18 Feb)
Se presenta un cronograma tentativo de desarrollo para el MVP de DaleFocus, con énfasis en lograr entregables incrementales cada día. Este plan abarca desde la concepción hasta el lanzamiento, cubriendo un periodo del **9 al 18 de febrero** (asumiendo febrero del presente año como ventana de desarrollo intensivo):

- **9 de Febrero:**
- 🔸 **Definición Final de MVP:** Reunión de equipo para acordar el alcance exacto del MVP, confirmando qué funcionalidades entran y cuáles se postergan (basadas en la lista de la Sección 2). Dejar por escrito esta especificación final.
- 🔸 **Perfilamiento de Personalidades:** Documentar las 4 personalidades de usuario (Coach Pro, Pana Real, Sargento, Meme-Lord) con ejemplos de tono para cada una. Esto servirá para las pruebas de los mensajes motivacionales y asegurará consistencia en todos los textos de la app dirigidos al usuario.
- 🔸 **Mockup del Emotional Check-in:** Diseñar un boceto de la pantalla/modal donde el usuario selecciona su barrera emocional. Debe ser muy sencillo e intuitivo (por ejemplo, 4 botones grandes con emojis representativos 🤯 🤔 😴 😰 y etiquetas). Herramientas: se puede usar Figma o papel y lápiz, lo importante es decidir la interfaz.
- **10 de Febrero:**
- 🔸 **Wireframes de Pantallas Principales:** Crear wireframes (baja fidelidad) para las ~5 pantallas clave del MVP:
  1. Pantalla de **Check-in de Barrera Emocional** (selección de estado).
  1. Pantalla de **Ingreso de Tarea** (input para título de tarea, con opción de confirmar y activar atomización).
  1. Pantalla o sección de **Lista de Pasos Generados** para una tarea (mostrar pasos con checkbox o similar).
  1. **Temporizador Pomodoro** en ejecución (quizá un componente modal o aparte con el reloj y botón de terminar).
  1. **Dashboard de Métricas** (visualización de Focus Index, etc., y progreso general).

  Estos wireframes guiarán el desarrollo frontend. Revisión con el equipo para asegurarse de la usabilidad. - 🔸 **Setup Inicial del Proyecto:** Configurar el repositorio y entorno: - Inicializar proyecto Frontend (React + Vite). - Inicializar proyecto Firebase (Firestore, Auth) y crear un proyecto en la consola de Firebase. - Obtener las credenciales/API keys necesarias para la **API de GPT-5.1** (OpenAI u otro proveedor) y almacenarlas en un lugar seguro (variables de entorno en las Cloud Functions). - Configurar reglas básicas de Firestore (sólo usuarios logueados pueden leer/escribir, regla provisional). - (Si se decidiera mantener la opción Claude por backup) Obtener API key de Anthropic Claude, pero según plan principal usaremos GPT.
- **11–12 de Febrero:**
- 🔸 **Implementación UI Básica:** Comenzar a codificar el frontend:
  - Componentes React para cada pantalla delineada en los wireframes.
  - Navegación simple entre pantallas (React Router o manejo de estado condicional si es SPA de una sola vista).
  - Context API para estado global: estado del usuario (sesión iniciada o no, personalidad), estado de tarea actual en progreso, etc.
  - No enfocarse aún en estilado perfecto; usar Tailwind utilitariamente para posicionamiento. El objetivo es tener la estructura y flujo funcional aunque se vea crudo.
- 🔸 **Integración de API de IA (Atomizador):** En paralelo, implementar la Cloud Function /atomizeTask:
  - Código Node/Typescript que reciba la petición con tarea y barrera.
  - Llamar a la API de OpenAI GPT-5.1 (usando su SDK o fetch con el endpoint correspondiente). Enviarle el prompt construido según Sección 3.
  - Recibir la respuesta JSON y parsearla. Guardar los datos en Firestore: crear un documento en tasks y múltiples documentos en steps ligados a esa task.
  - Manejar posibles errores (timeout de la API, respuesta mal formateada) con reintentos o defaults (en caso extremo, devolver mensaje de error al frontend).
  - Probar la función de forma aislada (usar firebase emulators o desplegar función y hacer curl).
- 🔸 **Modelo de Datos en Firestore:** Configurar las colecciones en Firestore:
  - Definir reglas de validación para campos principales (por ejemplo, tasks.status solo puede ser ciertos valores, steps.order tipo number, etc., en la medida posible con reglas).
  - Crear documentos de ejemplo manualmente para verificar que la estructura satisface las consultas necesarias.
  - **Nota:** Firestore es schemaless, pero mantener consistencia en los campos según el modelo de Sección 4.
- 🔸 **Autenticación Básica:** Implementar Firebase Auth en el frontend:
  - Pantalla de registro/login (email-password simple para MVP).
  - Enlazar con Firestore: tras registro, crear entrada en users con datos por defecto (personality = "Coach Pro" por default, etc.).
  - Proteger las rutas/pantallas de la app para solo usarlas autenticado (redireccionar a login si no).
  - Permitir actualización de perfil para elegir personalidad.
- **13–14 de Febrero:**
- 🔸 **Motor Pomodoro Funcional:** Desarrollar el componente de temporizador:
  - Estado que cuente regresivamente de 25:00 a 0, con opción de detener o pausar (si se decide incluir pausa).
  - Sonido o alerta al terminar (puede ser algo sencillo por ahora).
  - Botones para iniciar pomodoro en un paso específico desde la lista de pasos, o un pomodoro libre desde el dashboard.
  - Integrar con backend: al iniciar, tal vez crear un registro provisional de sesión; al finalizar o cancelar, llamar Cloud Function /completeSession para guardar.
  - Actualizar UI de pasos: si un paso fue completado durante el pomodoro, marcarlo como hecho.
- 🔸 **Flujo de Tarea -> Pasos -> Sesión Completo:** Unir todas las piezas implementadas:
  1. Usuario inicia sesión, selecciona barrera emocional.
  1. Escribe título de tarea y envía.
  1. Ver en la UI un estado de "Generando plan..." mientras la función de IA corre; luego la lista de pasos aparece.
  1. Usuario inicia el primer paso con "Empezar Pomodoro".
  1. Tras 25 min, termina la sesión; se marca el paso como completado y se propone el siguiente paso (highlight nextBestActionId).
  1. Usuario puede seguir con el siguiente pomodoro o tomar un descanso (según la técnica).
  1. Finalmente, puede marcar la tarea completa cuando todos sus pasos estén listos (o manualmente).
  1. Probar este flujo de cabo a rabo para una tarea ficticia y depurar cualquier fallo (ej: pasos no cargándose, etc.).
- 🔸 **Guardar sesiones y progreso:** Asegurarse de que:
  - Cada sesión completada agrega un doc en sessions.
  - Al completar un paso, actualizar su documento status = "completed" y completedAt.
  - Si todos los pasos de una tarea se completan, actualizar task.status = "completed" y completedAt.
  - Considerar casos: el usuario puede abandonar una tarea a medio camino (podríamos marcarla "abandoned" manualmente).
  - Actualizar contadores diarios en metrics/daily vía Cloud Functions triggers (si tiempo permite; si no, calculamos on the fly en dashboard).
- **15–16 de Febrero:**
- 🔸 **Mensajes de Recompensa IA:** Implementar la generación de frases motivacionales post-pomodoro:
  - Cloud Function /generateReward que recibe userId (para saber personalidad) y contexto (quizá qué logró: "completó un pomodoro de X min" o "terminó el paso 3 de 5 de tal tarea").
  - Llamar a GPT-5-mini con un prompt breve que incluya la personalidad y una instrucción de dar un mensaje de celebración cortito.
  - Devolver el mensaje y mostrarlo en la UI inmediatamente al usuario (toast, modal o en el dashboard).
  - Preparar algunos mensajes de ejemplo offline para cada personalidad, por si la IA falla (fallbacks).
- 🔸 **Dashboard de Métricas en Vivo:** Construir la pantalla de métricas:
  - Lógica para calcular Focus Index, Time-to-Action, Momentum con datos reales del usuario. Puede hacerse en frontend obteniendo los últimos X tasks/sessions, o invocando la Cloud Function de métricas.
  - Mostrar el Focus Index y Momentum de forma destacada (ej. con íconos 📊⚡🔥 como en el boceto ASCII).
  - Incluir un gráfico sencillo (puede ser usando una librería básica o incluso ASCII en consola por ahora) para las barreras de la semana. Alternativamente, simplemente listar "Barreras esta semana: ..." con emojis y números.
  - Optimizar consultas: usar quizás los docs diarios pre-calculados. Si no, filtrar Firestore (por ejemplo "dame sessions donde startAt > 7 días atrás").
  - Asegurar que la UI es entendible (colores o barras para porcentajes, etc.).
- 🔸 **Testing Integrado:** Con todas las piezas en su lugar, realizar pruebas completas:
  - Crear varios usuarios de prueba, con distintas personalidades.
  - Simular tareas en diferentes barreras, verificar que los pasos tienen sentido con la estrategia (ajustar prompt si se detectan incoherencias).
  - Verificar que las métricas calculan correctamente en distintos escenarios (ej., si no hay tareas completadas aún, evitar división por cero en Focus Index, etc.).
  - La aplicación debe ser capaz de recuperarse de errores de red o IA (por ejemplo, si la IA no responde en 10s, reintentar o notificar "Hubo un retraso, intenta de nuevo").
- **17 de Febrero:**
- 🔸 **Pulido de UI/UX:** Aplicar mejoras visuales y de experiencia:
  - Refinar estilos con Tailwind: colores agradables, modo oscuro/claro si se desea, tipografías consistentes.
  - Agregar íconos o ilustraciones suaves donde aporte (p.ej., un ícono de tomate para el pomodoro, emojis en botones de barrera, etc.).
  - Animaciones sutiles: por ejemplo, una pequeña animación al completar un paso (checkbox tick), o transición al mostrar el plan atomizado.
  - **Responsive design:** Probar la interfaz en tamaños móviles vs desktop y ajustar diseño flex/grid para que todo se vea correcto. Priorizar que sea usable en smartphone.
- 🔸 **Pruebas en Dispositivos:** Testear la app en múltiples entornos:
  - Diferentes navegadores (Chrome, Firefox, Safari) verificando compatibilidad.
  - Teléfono móvil (usar simulador o desplegar en Firebase Hosting temporal para abrir en un móvil real).
  - Revisar performance: que la carga inicial sea rápida (posiblemente usar lazy loading de algunos componentes o dividir el bundle si necesario, aunque en MVP con Vite es ligero).
  - Verificar que las reglas de seguridad realmente impiden accesos indebidos (intentar con un usuario A leer datos de usuario B vía Firestore listeners -> debe fallar).
- **18 de Febrero (Fecha Límite MVP):**
- 🔸 **Deploy y Verificación Final:** Desplegar la aplicación completa:
  - Hacer build de producción del frontend y subir a **Firebase Hosting**.
  - Desplegar las Cloud Functions (asegurarse de incluir todas las variables de entorno: keys de GPT-5.1 y GPT-5-mini, URL de API, etc.).
  - Configurar el dominio o subdominio para acceso público, con las correctas reglas de CORS para que el frontend pueda llamar a las funciones (Firebase Functions por defecto permiten llamados del mismo dominio).
  - Última pasada a las reglas de seguridad Firestore y pruebas end-to-end en el entorno ya desplegado (entorno de producción).
- 🔸 **Video Demo de 60 segundos:** Grabar una demo corta para presentar en Platzi (o la plataforma del hackathon/reto):
  - Escenario sugerido: Usuario entra, selecciona "🤯 Me siento abrumado" -> ingresa tarea "Preparar presentación" -> la IA genera pasos en unos segundos -> se muestra la lista de pasos -> el usuario inicia un pomodoro -> se ve el timer corriendo y completándose -> aparece un mensaje motivacional gracioso -> el usuario completa la tarea y luego abre el dashboard -> se destacan las métricas (Focus Index, etc.) y quizás se ve que la barrera más usada fue "Abrumado".
  - Incluir en el video texto sobreimpreso o locución explicando brevemente cada parte, enfatizando el **valor diferenciador**: "atomización de tareas con IA + enfoque en estado emocional + métricas personales".
  - Capturar la pantalla (usar un emulador o grabador de pantalla) mostrando las partes importantes. Usar captions o resaltados para puntos clave.
- 🔸 **Preparar Publicación (Platzi y otros):** Redactar un texto acompañando el video/demo para compartir:
  - Presentar el problema (procrastinación) y cómo DaleFocus lo aborda de manera única (IA + pomodoro + psicología).
  - Incluir **evidencia** o respaldo (por ejemplo, mencionar brevemente que las estrategias se basan en técnicas de productividad validadas 2024/2025, sin alargar).
  - Agradecer a la comunidad/mentores si aplica, e invitar a probar la app o dar feedback.
  - Tener capturas de pantalla atractivas (del check-in, de la lista de pasos con IA, del dashboard con gráficos).
  - Publicar en la plataforma definida (Platzi, Dev.to, LinkedIn, etc.) el día de entrega o demo.
- **19–20 de Febrero (Post-MVP - Deploy & Feedback):** *(Opcional, fuera del plazo principal pero recomendado)*
- Monitorear el rendimiento y los costos tras el despliegue. Verificar en las **dashboards de Firebase** que no haya picos inusuales de uso de IA ni errores en Functions.
- Recabar feedback de los primeros usuarios/ testers internos. Anotar bugs o mejoras rápidas y corregirlas con pequeños parches.
- Planificar las siguientes etapas basándose en ese feedback y en las cosas que quedaron fuera (las funciones Post-MVP priorizadas).

Con este roadmap, se busca entregar un MVP funcional en ~10 días de trabajo intenso, cubriendo todas las bases: idea validada, implementación técnica, y presentación del resultado.
## <a name="consideraciones-finales-y-técnicas"></a>Consideraciones Finales y Técnicas
Antes de concluir, resumimos algunas **decisiones técnicas específicas** que guiaron este plan y que vale la pena recalcar:

- **Estrategia de Estado en Frontend:** Dada la escala del MVP, se decidió **no añadir Redux ni otras librerías** de estado global para evitar complejidad innecesaria. La combinación de Context API nativa de React junto a hooks como useReducer será suficiente para manejar el estado global (usuario logueado, tarea/steps en curso, temporizador activo, etc.). Esta decisión puede revisarse tras el MVP; si el proyecto crece y vemos prop drilling excesivo o estado difícil de manejar, consideraríamos integrar una librería ligera como Zustand para mayor comodidad sin mucha refactorización.
- **Uso de Firebase Cloud Functions (Gen2):** Optamos por Cloud Functions de segunda generación por su mejor performance en arranque y escalabilidad a largo plazo. La región us-central1 equilibra latencia para usuarios en LATAM y costos. Runtime Node.js 20 permite usar features modernas de JS/TS y asegurar soporte a futuro. Estas funciones servirán como capa de API segura entre el frontend y los servicios externos (IA), manteniendo las credenciales y lógica sensible fuera del cliente.
- **Optimización de LLMs con *prompts* cacheados:** Para minimizar costos con GPT-5.1, reutilizaremos un prompt de sistema fijo para todas las peticiones de atomización, enviando sólo la parte variable (contexto del usuario) en cada llamada. Esto no solo ahorra tokens sino que reduce posibles variaciones indeseadas en las respuestas, asegurando consistencia en el formato JSON. Evaluaremos también almacenar en caché resultados de atomizaciones repetidas (si dos usuarios ponen tareas muy similares con misma barrera, podrían obtenerse pasos parecidos; sin embargo, por personalización quizás no valga la pena en MVP).
- **Endpoints y Validación:** Cada endpoint Cloud Function incluirá validaciones básicas de datos (ej. longitud máxima de título de tarea para no enviar prompts excesivamente largos a la IA, filtrado de lenguaje inapropiado básico si es necesario, etc.). Asimismo, implementaremos un simple **Rate Limit** por IP o por userId en la función de atomización para evitar abusos accidentales (podemos utilizar el contexto context.auth.uid más una variable global incremental, o integrar alguna library de rate limit; en MVP incluso un contador in-memory reiniciado cada minuto podría servir debido a baja escala).
- **Despliegue y Configuración:** Preparar una **checklist de despliegue** para no olvidar nada:
- Variables de entorno en Firebase: API keys de IA (OpenAI) y cualquier config (p.ej., URL base de API).
- Configuración de CORS en funciones HTTP si el dominio final difiere (Firebase Functions generalmente permiten orígenes Firebase Hosting del mismo proyecto).
- Verificar que la regla de autenticación está activa en Firestore (tuvimos esa regla en dev, asegurar que en prod no esté abierta).
- Activar el dominio custom si se usa (p.ej., dalefocus.web.app o dalefocus.com).
- Pasar todos los tests de login, flujo de tarea, etc., en la URL final antes de declararlo "done".
- **Diferenciadores clave para la demo:** Por último, al preparar la presentación, enfatizar qué hace especial a DaleFocus:
- **IA centrada en el usuario:** No es solo un chatbot genérico, sino un sistema que entiende tu obstáculo emocional y te da un plan accionable a tu medida.
- **Integración con técnica Pomodoro:** Muchas apps o to-do lists no van más allá de listar tareas; aquí directamente te pone en marcha con pomodoros y seguimiento.
- **Métricas personalizadas:** El usuario obtiene feedback cuantitativo de sus hábitos, algo que las apps de tareas tradicionales no ofrecen de forma significativa.

Estos puntos, junto con una interfaz amigable, formarán la narrativa del pitch. Prepararemos un guion para el video que resalte una historia de uso (user story) breve: *"Juan siempre se sentía abrumado al estudiar... Descubre DaleFocus: selecciona 'abrumado', ingresa 'estudiar capítulo 3', la IA le desglosa la tarea... 25 minutos después, completa su primer paso y recibe un meme motivador... ahora Juan ve en su dashboard que su Focus Index mejora semana a semana."* – Algo por el estilo para conectar con la audiencia de Platzi u otros emprendedores.

Con todo lo anterior, **DaleFocus** tiene un plan de desarrollo sólido para el MVP, combinando innovaciones de IA con prácticas probadas de productividad. Este documento servirá de guía durante las próximas dos semanas de implementación intensa, asegurando que el equipo esté alineado y enfocado en entregar valor real a los usuarios desde el día 1. ¡Manos a la obra! 🚀

-----
