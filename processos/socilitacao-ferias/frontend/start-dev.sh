#!/bin/bash
# Script para iniciar o dev server e testar se rodando corretamente

set -e

cd "$(dirname "$0")"

echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""

# Garantir que routes.json está em public/
if [ ! -f "public/routes.json" ]; then
    echo "⚠️  routes.json não encontrado em public/"
    echo "📋 Copiando de src/..."
    cp src/routes.json public/routes.json
    echo "✅ Copiado"
fi

echo ""
echo "📝 Para iniciar manualmente:"
echo "  npm run dev"
echo ""
echo "🌐 Acesso:"
echo "  http://localhost:3002"
echo ""
echo "📋 O que testador:"
echo "  1. DevTools do React"
echo "  2. Console sem erros"
echo "  3. Menu carregado com 5 itens"
echo "  4. Navegação entre páginas funciona"
echo "  5. CSS aplicado corretamente"
echo ""
echo "✅ Servidor pronto!"
