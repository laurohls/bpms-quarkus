# HERANÇA E CUSTOMIZAÇÃO DO MASTER FRONTEND

Este documento descreve como criar novos módulos BPMS que herdam o layout e estilos base do master frontend.

## 📋 Padrão de Herança

Cada módulo BPMS segue este padrão:

```
processos/
├── socilitacao-ferias/
│   └── frontend/          # Específico de férias
│       ├── src/
│       │   ├── App.tsx    # CUSTOMIZADO: Lógica de férias
│       │   ├── App.css    # CUSTOMIZADO: Estilos específicos
│       │   └── ...
│       ├── package.json   # Referencia master
│       └── ...
└── ...

modulos/
└── frontend/              # MASTER: Layout + componentes base
    ├── src/
    │   ├── App.tsx        # Layout genérico
    │   ├── App.css        # Estilos base
    │   └── ...
    └── ...
```

## 🔄 Processo de Herança

### Opção 1: Copiar e Adaptar (Recomendado)

1. **Copiar estrutura base** do `modulos/frontend`
2. **Manter `package.json`** com mesmas dependências
3. **Customizar `App.tsx`** com lógica específica do módulo
4. **Estender `App.css`** com estilos adicionais
5. **Herdar componentes** como Sidebar, PageHeader, etc.

### Opção 2: Importar via Package (Para Futuro)

Quando o master for publicado como package:

```json
{
  "dependencies": {
    "bpms-frontend-master": "^1.0.0"
  }
}
```

```typescript
// App.tsx do módulo
import { AppShell, Sidebar, PageHeader } from 'bpms-frontend-master'

export default function MyModuleApp() {
  return (
    <AppShell>
      <Sidebar />
      <MainContent>{/* Lógica específica */}</MainContent>
    </AppShell>
  )
}
```

## 📝 Exemplo: Módulo de Férias

### 1. Estrutura Base (copiada do master)

```
processos/socilitacao-ferias/frontend/
├── src/
│   ├── App.tsx          # ← CUSTOMIZADO
│   ├── App.css          # ← CUSTOMIZADO
│   ├── components/      # ← NOVO: Específico de férias
│   │   ├── VacationForm.tsx
│   │   ├── TaskList.tsx
│   │   └── ...
│   ├── main.tsx         # (herdado do master)
│   └── index.css        # (herdado do master)
├── package.json         # (mesmas deps do master)
└── ...
```

### 2. Customização do App.tsx

```typescript
// Herda a estrutura base do master
import { CurrentUserProvider, Sidebar, PageHeader } from '../../../modulos/frontend/src/App'

export default function VacationApp() {
  // Adiciona lógica específica de férias
  const [requests, setRequests] = useState([])
  
  return (
    <CurrentUserProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <PageHeader title="Solicitação de Férias" />
          {/* Componentes específicos de férias */}
          <VacationRequestForm />
          <VacationRequestList requests={requests} />
        </main>
      </div>
    </CurrentUserProvider>
  )
}
```

### 3. Estender Estilos

```css
/* Em App.css do módulo */
@import '../../../modulos/frontend/src/App.css';

/* Customizações específicas */
.vacation-form {
  max-width: 600px;
}

.vacation-status {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #e8f5e9;
  color: #2e7d32;
}
```

## 🎨 Padrões de Reutilização

### Context (Usuário)

```typescript
// Disponível em qualquer módulo
import { useCurrentUser } from '../../../modulos/frontend/src/App'

function MyComponent() {
  const { user, switchUser } = useCurrentUser()
  return <div>Olá, {user.name}</div>
}
```

### Layout Genérico

```typescript
// Estrutura padrão para todas páginas
<CurrentUserProvider>
  <div className="app-shell">
    <Sidebar currentView="tasks" />
    <main className="main-content">
      <PageHeader title="Página" subtitle="Subtítulo" />
      {/* Conteúdo específico */}
    </main>
  </div>
</CurrentUserProvider>
```

### Variáveis CSS

```css
/* Disponível globalmente */
:root {
  --bpms-blue: #004f9f;
  --bpms-navy: #0a192f;
  --bpms-white: #ffffff;
  --bpms-content: #f4f7f6;
  --bpms-line: #d9e1d9;
  --bpms-text: #1a2332;
  --bpms-muted: #77827b;
}

/* Usar em estilos do módulo */
.my-component {
  border: 1px solid var(--bpms-line);
  color: var(--bpms-text);
}
```

## 🔄 Mantendo Sincronização

Quando fazer atualizações no master:

1. **Mudanças em `App.tsx`**
   - Afetam todos os módulos que herdam
   - Considere compatibilidade retroativa
   - Documente breaking changes

2. **Mudanças em `App.css`**
   - Afetam layout e temas globais
   - Modules podem override com especificidade

3. **Novos componentes**
   - Adicione em `modulos/frontend`
   - Exporte para que modules os usem

## ✅ Checklist para Novo Módulo

- [ ] Copiar estrutura de `modulos/frontend`
- [ ] Atualizar `package.json` com nome específico
- [ ] Customizar `App.tsx` com lógica do módulo
- [ ] Adicionar componentes específicos em `src/components/`
- [ ] Estender `App.css` com estilos adicionais
- [ ] Testar navegação e layout
- [ ] Atualizar `README.md` com docs do módulo
- [ ] Adicionar ao `docker-compose.yml` se necessário
- [ ] Validar integração com motor

## 📚 Exemplos de Módulos

Padrão esperado para novos módulos BPMS:

- **Solicitação de Férias** (existente)
  - Formulário de solicitação
  - Lista de tarefas de aprovação
  - Histórico de solicitações

- **Aprovação de Despesas** (futuro)
  - Formulário de despesa
  - Workflow de aprovação
  - Relatório de gastos

- **Gestão de Projetos** (futuro)
  - Timeline de projetos
  - Alocação de recursos
  - Status reports

---

**Última atualização**: Agosto 2026
