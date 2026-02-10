# 05 PlatziPost

Texto listo para pegar en el comentario de entrega.

---

## DaleFocus - de la procrastinacion a la accion con IA

Hoy quiero compartir **DaleFocus**, una app web que ataca la procrastinacion desde el origen: el bloqueo emocional al empezar.

### Demo y codigo
- Demo: https://dalefocus-3f26d.web.app/
- Repo: https://github.com/sebasgc0399/DaleFocus

### Que hace diferente a DaleFocus
- **Atomizador Core (JSON accionable):** convierte una tarea difusa en pasos concretos con estimaciones y criterios.
- **Flujo circular de accion:** paso pequeno -> Pomodoro -> recompensa motivacional.
- **Metricas de habito:** Focus Index, Time-to-Action y Momentum.
- **Check-in emocional real:** la barrera (`overwhelmed`, `uncertain`, `bored`, `perfectionism`) condiciona la estrategia del plan.

### Stack
- React 18 + Vite + Tailwind
- Firebase Auth + Firestore + Cloud Functions Gen2
- OpenAI (`gpt-5-2025-08-07` y `gpt-5-mini-2025-08-07`)

### Flujo demo (60s)
1. Login
2. Check-in emocional
3. Escribir tarea y atomizar
4. Ejecutar pasos con Pomodoro
5. Completar sesion y recompensa
6. Dashboard de metricas

### Siguientes pasos
- Cerrar UI de login/register.
- Implementar calculo real de metricas en backend.
- Integrar recompensa en vivo al finalizar cada Pomodoro.
- Agregar rate limiting en atomizacion.

Gracias por revisar. Cualquier feedback tecnico es bienvenido.

---

Opcional: agregar video aqui
- Video: <pegar_link_video>
