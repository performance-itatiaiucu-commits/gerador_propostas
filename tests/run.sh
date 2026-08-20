#!/usr/bin/env bash
# Executa a suíte de testes do gerador de propostas.
#
#   ./tests/run.sh
#
# Os testes unitários rodam apenas com Node (sem dependências).
# Os testes de integração usam jsdom; se ele não estiver instalado,
# são ignorados sem falhar a suíte (instale com: npm i -D jsdom).

set -euo pipefail
cd "$(dirname "$0")/.."

node tests/pdf-export.test.mjs
node tests/pdf-export.integration.test.mjs
