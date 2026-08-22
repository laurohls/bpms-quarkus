# 🔧 Guia de Correção - Resolução de Imports do Master Frontend

## Status: ⚠️ Configuração em Progresso

O projeto Férias está com problemas de resolução de imports do master frontend. Este documento guia a correção.

## Problema Identificado

```
error TS2307: Cannot find module 'bpms-frontend-master' or its corresponding type declarations.
```

## Causas Potenciais

1. ❌ TypeScript não encontra o alias `bpms-frontend-master`
2. ❌ O arquivo `index.ts` do master não está sendo exatado
3. ❌ Paths do `tsconfig.json` não estão corretos
4. ❌ Vite alias não está sincronizado com TypeScript

## Solução Recomendada (Workaround Imediato)

### Opção 1: Importar Diretamente do Master (Mais Seguro)

Substituir:
```typescript
import { useApi, useCurrentUser } from 'bpms-frontend-master'
```

Por:
```typescript
import { useApi, useCurrentUser } from '../../modulos/frontend/src/index'
```

### Opção 2: Usar Path Relativo

Se os imports parecem complexos, use caminhos relativos simples:

```typescript
// Em: processos/socilitacao-ferias/frontend/src/components/views/TaskListView.tsx
import { useApi } from '../../../modulos/frontend/src'
```

### Opção 3: Desabilitar TypeScript Check no Build

Adicionar ao `package.json`:
```json
"scripts": {
  "build": "vite build"  // Remove: tsc -b &&
}
```

## Passos para Resolver

### 1. Limpar Cache TypeScript
```bash
cd processos/socilitacao-ferias/frontend
rm -rf .tsbuildinfo
rm -rf node_modules/.tmp
npm install
```

### 2. Verificar Imports (Workaround - Substituir todos os imports)

Executar substitição em massa:

```bash
# No Férias frontend, substituir:
find src -name "*.tsx" -type f -exec sed -i \
  "s|from 'bpms-frontend-master'|from '../../modulos/frontend/src'|g" {} +
```

### 3. Corrigir Type Errors nos Formulários

#### Erro em `AnalisarSolicitacaoForm.tsx` linha 107:
```typescript
// Errado:
value={formData.parecer}
onChange={(e) => setFormData({ ...formData, parecer: e.target.value })}

// Correto:
value={formData.parecer}
onChange={(e) => setFormData({ ...formData, parecer: e.target.value as 'pendente' | 'aprovado' | 'rejeitado' | 'condicional' })}
```

#### Erro em `ValidarGestorForm.tsx` linha 117:
```typescript
// Usar type casting:
onChange={(e) => setFormData({ ...formData, viabilidade: e.target.value as any })}
```

## Arquivos para Atualizar

```
src/App.tsx                                  ✓ Type annotations
src/components/forms/AnalisarSolicitacaoForm.tsx        Type casting
src/components/forms/ValidarGestorForm.tsx            Type casting
src/components/forms/CancelarFeriasForm.tsx            Import path
src/components/forms/SolicitarFeriasForm.tsx           Import path
src/components/views/TaskListView.tsx                  Import path
src/components/views/TaskDetailView.tsx                Import path + Type
src/components/views/MinhasSolicitacoesView.tsx        Import path + Type
src/components/views/SolicitarFeriasView.tsx           Import path
```

## Solução Definitiva (Próximas Versões)

Para uma solução permanente, considerar:

1. **Monorepo com Yarn Workspaces**
   - Define `bpms-frontend-master` como pacote workspace
   - Resolução automática de imports

2. **Publicar Master no NPM Privado**
   - Não depender de `file://` paths
   - CI/CD publica versões

3. **Build Master para `dist/`**
   - Exportar master como biblioteca pré-compilada
   - Férias importa do dist compilado

---

## Status da Implementação

- [x] Master frontend criado
- [x] Férias frontend estrutura criada
- [x] Formulários individuais criados
- [x] Views criadas
- ⚠️ Resolução de imports (em progresso)
- [ ] Teste local (npm run dev)
- [ ] Teste build (npm run build)
- [ ] Teste Docker

---

**Próximo Passo:** Aplicar Opção 2 (usar path relativo) como workaround imediato.
