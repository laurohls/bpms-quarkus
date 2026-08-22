# 📋 TEMPLATE PARA NOVOS PROJETOS

Este documento explica como replicar a estrutura Férias para novos projetos (ex: Viagens, Equipamentos, Capacitações).

---

## 🎯 Objetivo

Criar novos frontends que **herdam tudo do master** e contêm **apenas lógica específica do processo**.

---

## 📋 Pré-requisitos

- ✅ Master frontend já criado em `modulos/frontend/`
- ✅ Node.js 20+
- ✅ Estrutura de processos criada

---

## 🚀 Como Criar um Novo Projeto

### Passo 1: Copiar Estrutura Base

```bash
# Copiar estrutura do Férias como template
cd processos

# Duplicar pasta
Copy-Item -Path "socilitacao-ferias\frontend" -Destination "novo-processo\frontend" -Recurse

# Ou manualmente:
mkdir novo-processo/frontend
cd novo-processo/frontend
```

### Passo 2: Atualizar package.json

```json
{
  "name": "bpms-novo-processo",
  "version": "1.0.0",
  "description": "Frontend para novo processo",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "bpms-frontend-master": "file:../../modulos/frontend",
    "axios": "^1.19.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}
```

### Passo 3: Copiar Master para Vendor

```bash
# De dentro de novo-processo/frontend/

# 1. Remover vendor antigo (se houver)
rm -r src/vendor/master

# 2. Copiar master atual
cp -r ../../modulos/frontend/src src/vendor/master

# 3. Instalar dependências
npm install
```

### Passo 4: Atualizar routes.json

Arquivo: `src/routes.json`

```json
{
  "basePath": "/novo-processo",
  "routes": [
    {
      "path": "/",
      "name": "Nova Página 1",
      "component": "NovaView1",
      "visible": true,
      "icon": "📝"
    },
    {
      "path": "/nova-pagina-2",
      "name": "Nova Página 2",
      "component": "NovaView2",
      "visible": true,
      "icon": "✨"
    }
  ]
}
```

### Passo 5: Criar Tipos Específicos

Arquivo: `src/types/index.ts`

```typescript
// Tipos específicos do novo processo
export interface NovoProcessoRequest {
  id: string
  solicitante: string
  data: string
  status: 'solicitado' | 'pendente-gestor' | 'aprovado' | 'rejeitado' | 'cancelado'
  observacoes?: string
  dataCriacao: string
  dataAtualizacao: string
}

export interface NovoProcessoFormData {
  campo1: string
  campo2: string
  data: string
  // ...
}

// Re-exportar tipos do master se necessário
export type { User, ApiResponse, PaginatedResponse } from 'bpms-frontend-master'
```

### Passo 6: Criar Views

Arquivo: `src/components/views/NovaView1.tsx`

```typescript
import { PageHeader } from 'bpms-frontend-master'
import NovaForm1 from '../forms/NovaForm1'

export default function NovaView1() {
  return (
    <div className="nova-view-1">
      <PageHeader
        title="Nova Página 1"
        subtitle="Descrição da funcionalidade"
      />
      <NovaForm1 />
    </div>
  )
}
```

### Passo 7: Criar Formulários

Arquivo: `src/components/forms/NovaForm1.tsx`

```typescript
import { useState } from 'react'
import { useApi } from 'bpms-frontend-master'
import type { NovoProcessoFormData } from '../../types'

export default function NovaForm1() {
  const [formData, setFormData] = useState<NovoProcessoFormData>({
    campo1: '',
    campo2: '',
    data: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { post } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await post('/solicitacoes', formData)
      if (response.success) {
        alert('Solicitação criada com sucesso!')
        setFormData({ campo1: '', campo2: '', data: '' })
      } else {
        setError(response.error || 'Erro ao criar solicitação')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="nova-form-1">
      <input
        type="text"
        value={formData.campo1}
        onChange={(e) =>
          setFormData({ ...formData, campo1: e.target.value })
        }
        placeholder="Campo 1"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

### Passo 8: Adicionar Estilos

Arquivo: `src/App.css`

```css
/* Importar estilos do master (já está via vendor) */

/* Estilos específicos do novo processo */
.nova-view-1 {
  padding: var(--spacing-lg);
}

.nova-form-1 {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 600px;
}

.nova-form-1 input {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.nova-form-1 button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
}

.nova-form-1 button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nova-form-1 .error {
  color: var(--color-error);
  font-size: 0.875rem;
}
```

### Passo 9: Testar Build

```bash
npm run build

# Esperado:
# ✓ built in 230ms
# dist/ criado com sucesso
```

### Passo 10: Testar Desenvolvimento

```bash
npm run dev

# Acessar: http://localhost:3002
# Verificar rotas carregadas do routes.json
# Testar navegação
```

---

## 📂 Estrutura Final

```
processos/novo-processo/frontend/
├── src/
│   ├── vendor/master/          ← COPIADO DO MASTER (11 arquivos)
│   ├── components/
│   │   ├── forms/
│   │   │   └── NovaForm1.tsx
│   │   ├── views/
│   │   │   └── NovaView1.tsx
│   │   └── shared/
│   │       └── (componentes reutilizáveis)
│   ├── types/
│   │   └── index.ts            ← TIPOS ESPECÍFICOS
│   ├── utils/
│   │   └── (utilitários específicos)
│   ├── routes.json             ← CONFIGURAÇÃO DE ROTAS
│   ├── App.tsx                 ← COMPONENTE RAIZ
│   ├── App.css                 ← ESTILOS
│   ├── main.tsx
│   └── index.css
├── vite.config.ts              ← (copiar de Férias)
├── tsconfig.json               ← (copiar de Férias)
├── tsconfig.app.json           ← (copiar de Férias)
├── package.json                ← (atualizar nome/descrição)
├── Dockerfile                  ← (copiar de Férias)
└── nginx.conf                  ← (copiar de Férias)
```

---

## ✅ Checklist de Criação

- [ ] Pasta criada: `processos/novo-processo/frontend/`
- [ ] `package.json` atualizado com nome correto
- [ ] Master copiado para `src/vendor/master/`
- [ ] `npm install` executado com sucesso
- [ ] `routes.json` criado com rotas específicas
- [ ] `src/types/index.ts` criado com tipos específicos
- [ ] Views criadas em `src/components/views/`
- [ ] Formulários criados em `src/components/forms/`
- [ ] `App.css` com estilos específicos
- [ ] `npm run build` executa com sucesso
- [ ] `npm run dev` inicia sem erros
- [ ] Rotas aparecem no menu
- [ ] Navegação funciona entre páginas

---

## 🔄 Sincronizar com Atualizações do Master

Quando o master é atualizado, sincronizar em todos os projetos:

```bash
# Em cada projeto (novo-processo, viagens, etc)
cd processos/xxx/frontend

# 1. Remover vendor antigo
rm -r src/vendor/master

# 2. Copiar novo master
cp -r ../../modulos/frontend/src src/vendor/master

# 3. Testar build
npm run build

# 4. Commit
git add .
git commit -m "chore: update master vendor"
```

---

## 🎓 Boas Práticas

### ✅ DO - Colocar no Master
- Componentes de Layout (Sidebar, PageHeader, Footer)
- Hooks reutilizáveis (useApi, useCurrentUser)
- Services (apiClient, etc)
- Types comuns (User, ApiResponse)
- Utils comuns (date helpers, formatters)

### ❌ DON'T - Colocar no Projeto
- Lógica específica do processo
- Formulários específicos
- Views específicas
- Tipos específicos do domínio
- Estilos de páginas específicas

---

## 📊 Exemplo de Projeto Completo

Projeto **Viagens** como exemplo:

```typescript
// src/types/index.ts
export interface ViagemRequest {
  id: string
  solicitante: string
  dataInicio: string
  dataFim: string
  destino: string
  motivo: 'confer' | 'reuniao' | 'treinamento' | 'outro'
  orcamento: number
  status: 'solicitado' | 'pendente-gerente' | 'aprovado' | 'rejeitado'
}

// src/components/views/
// - SolicitarViagemView.tsx
// - MinhasViagensView.tsx
// - AnalisarSolicitacaoView.tsx

// src/components/forms/
// - SolicitarViagemForm.tsx
// - AnalisarSolicitacaoForm.tsx
// - CancelarViagemForm.tsx

// src/routes.json
{
  "basePath": "/viagens",
  "routes": [
    {
      "path": "/",
      "name": "Solicitar Viagem",
      "component": "SolicitarViagemView"
    },
    {
      "path": "/minhas-viagens",
      "name": "Minhas Viagens",
      "component": "MinhasViagensView"
    }
  ]
}
```

---

## 🚀 Deploy

Cada projeto pode ser deployado independentemente:

```bash
# Build
docker build -t bpms-novo-processo:1.0 .

# Run
docker run -d -p 3001:80 -e VITE_API_URL=http://api:8080 bpms-novo-processo:1.0
```

---

## 💡 Dicas Importantes

1. **Sempre copiar vendor fresco**
   - Garante que o projeto tem a versão correta do master
   - Sincronizar periodicamente com o master

2. **Não editar vendor/master/**
   - Qualquer mudança será perdida na próxima sincronização
   - Mudanças devem ser feitas no `modulos/frontend/src`

3. **Reutilizar, não duplicar**
   - Não reimplementar hooks do master
   - Não reimplementar types do master
   - Não reimplementar services do master

4. **Organização de código**
   - Views/Pages: renderizam Forms
   - Forms: lógica de submit, validação
   - Components/shared: componentes reutilizáveis no projeto
   - Types: tipos específicos do domínio
   - Utils: funções utilitárias específicas

---

## 📚 Referências

- [Master Frontend](../../modulos/frontend/) - Código-fonte do master
- [IMPLEMENTACAO_FINAL.md](../socilitacao-ferias/frontend/IMPLEMENTACAO_FINAL.md) - Documentação Férias
- [GUIA_DE_USO.md](../socilitacao-ferias/frontend/GUIA_DE_USO.md) - Guia de uso Férias
- [routes.json](../socilitacao-ferias/frontend/src/routes.json) - Exemplo de rotas

---

*Template atualizado em 2024 - Pronto para novos projetos!*
