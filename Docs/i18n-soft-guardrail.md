# i18n Soft Guardrail (No Bloqueante)

Objetivo: reducir hardcodes de UI en pantallas ya migradas a i18n.

## Regla sugerida
- En archivos migrados (`App`, `Login`, `Dashboard`, `PomodoroTimer`, `BarrierCheckIn`, `TaskInput`, `StepList`, `BottomNav`, `Settings`, `RewardPopup`), evitar introducir nuevos textos visibles hardcodeados.
- Usar keys de i18n por namespace (`common`, `auth`, `dashboard`, `task`, `pomodoro`, `navigation`).

## Como revisarlo en PR
- Ejecutar `rg` sobre literales en componentes migrados.
- Si aparece texto visible nuevo, preferir moverlo a locales.

## Naturaleza del guardrail
- Es guia de calidad no bloqueante.
- No falla CI.
- Se reporta como observacion en review cuando aplica.
