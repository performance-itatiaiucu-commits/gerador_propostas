#!/usr/bin/env bash
# Publica a branch atual no GitHub (origin)
#
# Uso:
#   ./push.sh
#

set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "HEAD" ]; then
  echo "Erro: HEAD desanexado. Por favor, faça checkout em uma branch antes de fazer push." >&2
  exit 1
fi

echo "Publicando a branch '${BRANCH}' no GitHub (origin)..."
git push -u origin "${BRANCH}"
echo "✓ Branch '${BRANCH}' enviada com sucesso para o GitHub!"
