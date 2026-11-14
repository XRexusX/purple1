# Documentación de Purple 1 (SDD)

Primero se define, después se construye. Orden de lectura:

| # | Documento | Qué responde |
|---|---|---|
| 1 | [producto.md](producto.md) | ¿Qué problema resolvemos, para quién y cuál es la solución? ¿Qué NO entra? |
| 2 | [arquitectura.md](arquitectura.md) | ¿Con qué se construye y cómo se conectan las capas? |
| 3 | [diseno/identidad-visual.md](diseno/identidad-visual.md) | ¿Cómo se ve y cómo habla la marca? |
| 4 | [specs/](specs/) | ¿Qué hace cada funcionalidad y cómo se comprueba? (F1 a F5) |
| 5 | [decisiones.md](decisiones.md) | ¿Por qué se decidió cada cosa? |
| 6 | [tareas.md](tareas.md) | ¿Qué está hecho y qué sigue? |

Fuera de `docs/`: [CLAUDE.md](../CLAUDE.md) (reglas para el agente), [BITACORA_IA.md](../BITACORA_IA.md) (prompts y errores) y la skill [`ui-componentes`](../.claude/skills/ui-componentes/SKILL.md).

**Regla de oro:** si algo cambia, primero se actualiza el documento y después el código.
