# 📋 Diferença: Formulários vs Views

## Conceito Fundamental

| Aspecto | Formulário | View/Page |
|---------|-----------|-----------|
| **Propósito** | Coletar dados + enviar | Exibir página completa |
| **Responsabilidade** | Input + validation + submit | Lógica de página + roteamento |
| **Localização** | `components/forms/` | `components/views/` ou root |
| **Exemplo** | `SolicitarFeriasForm.tsx` | `SolicitarFerias.tsx` |
| **Reutilização** | Pode ser usado em múltiplos lugares | Específico de uma rota |

---

## Padrão: Formulário vs View

### ❌ ERRADO: Tudo junto

```
App.tsx → renderiza componente gigante
├─ Form logic
├─ Page layout
├─ Navigation
├─ Multiple forms
└─ Business logic misturada
```

### ✅ CORRETO: Separado

```
routes.json
  ↓
App.tsx → renderiza component específico
  ↓
View (SolicitarFerias.tsx)
  ├─ Page layout
  ├─ Page header
  ├─ Navigation local
  └─ Renderiza: <SolicitarFeriasForm />
       ↓
Form (SolicitarFeriasForm.tsx)
  ├─ Campos do formulário
  ├─ Validação
  ├─ Submit via useMutation
  └─ Mensagens de erro/sucesso
```

---

## Exemplo Real: Fluxo de Solicitação de Férias

### routes.json
```json
{
  "routes": [
    {
      "name": "Solicitar Férias",
      "path": "/solicitar",
      "component": "SolicitarFeriasView",
      "icon": "📝"
    }
  ]
}
```

### App.tsx
```typescript
import SolicitarFeriasView from './components/views/SolicitarFeriasView'

const COMPONENT_MAP = {
  SolicitarFeriasView,
}

// Em Routes:
routes.map(route => (
  <Route path={route.path} element={<COMPONENT_MAP[route.component]() />} />
))
```

### 1️⃣ View: `components/views/SolicitarFeriasView.tsx`

```typescript
/**
 * PAGE: Solicitar Férias
 * Responsabilidade: Layout da página + header + instruções
 * Renderiza: <SolicitarFeriasForm />
 */

import { PageHeader } from 'bpms-frontend-master'
import SolicitarFeriasForm from '../forms/SolicitarFeriasForm'
import '../styles/solicitar-ferias.css'

export default function SolicitarFeriasView() {
  return (
    <div className="solicitar-ferias-view">
      <PageHeader
        title="Solicitar Férias"
        subtitle="Preencha o formulário abaixo"
      />

      <div className="view-instructions">
        <h3>Como funciona?</h3>
        <ol>
          <li>Preencha as datas de início e término</li>
          <li>Descreva o motivo (opcional)</li>
          <li>Clique em "Solicitar"</li>
          <li>Sua solicitação será enviada para análise</li>
        </ol>
      </div>

      <div className="view-content">
        <SolicitarFeriasForm />
      </div>

      <div className="view-footer">
        <p>
          <strong>Nota:</strong> Solicitações são analisadas em até 2 dias úteis.
        </p>
      </div>
    </div>
  )
}
```

**Estilo:** `components/styles/solicitar-ferias.css`
```css
.solicitar-ferias-view {
  max-width: 900px;
  margin: 0 auto;
}

.view-instructions {
  background: #f9f9f9;
  padding: 20px;
  border-left: 4px solid var(--bpms-blue);
  margin: 20px 0;
  border-radius: 4px;
}

.view-instructions h3 {
  margin-top: 0;
  color: var(--bpms-navy);
}

.view-instructions ol {
  margin: 10px 0;
  padding-left: 20px;
}

.view-content {
  background: var(--bpms-white);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.view-footer {
  background: #e8f4f8;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}
```

### 2️⃣ Form: `components/forms/SolicitarFeriasForm.tsx`

```typescript
/**
 * FORM: Solicitar Férias
 * Responsabilidade: Coletar dados + validar + enviar
 * Usado por: SolicitarFeriasView
 * Pode ser reutilizado em: Modal, drawer, etc
 */

import { useState } from 'react'
import { useCurrentUser, useMutation } from 'bpms-frontend-master'

export type SolicitarFeriasFormData = {
  startDate: string
  endDate: string
  reason?: string
}

export default function SolicitarFeriasForm() {
  const { user } = useCurrentUser()
  const { execute: submit, loading, error } = useMutation('post')

  const [formData, setFormData] = useState<SolicitarFeriasFormData>({
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit('/api/vacation-requests', {
      employeeId: user.id,
      ...formData,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="ferias-form">
      {/* Fields */}
    </form>
  )
}
```

---

## Estrutura Completa Recomendada

```
processos/socilitacao-ferias/frontend/src/components/
│
├── forms/                      # 🔵 Apenas formulários (form logic)
│   ├── SolicitarFeriasForm.tsx
│   ├── AnalisarSolicitacaoForm.tsx
│   ├── ValidarGestorForm.tsx
│   └── CancelarFeriasForm.tsx
│
├── views/                      # 🟢 Páginas/Views (page logic)
│   ├── SolicitarFeriasView.tsx
│   ├── AnalisarSolicitacoesView.tsx
│   ├── MinhasSolicitacoesView.tsx
│   └── DashboardFeriasView.tsx
│
├── shared/                     # 🟡 Componentes compartilhados
│   ├── VacationCard.tsx       # Card que exibe uma solicitação
│   ├── VacationList.tsx       # Lista de solicitações
│   └── StatusBadge.tsx        # Badge de status
│
└── styles/                     # Estilos organizados por feature
    ├── solicitar-ferias.css
    ├── analisar-solicitacoes.css
    └── minhas-solicitacoes.css
```

### Quando cada um é usado?

**Forms:**
- Quando você precisa **coletar dados**
- Quando precisa **validar + enviar**
- Exemplo: `<SolicitarFeriasForm />`

**Views:**
- Quando você renderiza uma **página inteira**
- Quando uma **rota aponta para ela**
- Exemplo: `<Route path="/solicitar" element={<SolicitarFeriasView />} />`

**Shared:**
- Componentes que aparecem em **múltiplas páginas**
- Exemplo: `<VacationCard vacation={...} />`

---

## Exemplo: Rota com Múltiplos Formulários

### View: `AnalisarSolicitacoesView.tsx`

```typescript
/**
 * PAGE: Analisar Solicitações (RH)
 * Renderiza: Lista de solicitações + formulário de análise
 */

import { useApi, PageHeader } from 'bpms-frontend-master'
import { useState } from 'react'
import SolicitacoesList from '../shared/SolicitacoesList'
import AnalisarSolicitacaoForm from '../forms/AnalisarSolicitacaoForm'

type Solicitacao = { id: string; employeeName: string; status: string }

export default function AnalisarSolicitacoesView() {
  const { data: solicitacoes } = useApi<Solicitacao[]>('/api/vacation-requests/pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="analisar-view">
      <PageHeader
        title="Analisar Solicitações"
        subtitle="Revisão e aprovação de solicitações de férias"
      />

      <div className="view-grid">
        {/* Lista à esquerda */}
        <div className="list-panel">
          <SolicitacoesList
            solicitacoes={solicitacoes || []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Formulário à direita */}
        <div className="form-panel">
          {selectedId ? (
            <AnalisarSolicitacaoForm solicitacaoId={selectedId} />
          ) : (
            <div className="empty-state">
              Selecione uma solicitação à esquerda
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Padrão de Nomes

Use nomes que deixam claro o tipo:

```
✅ CORRETO
├── SolicitarFeriasForm.tsx      (form = formulário)
├── SolicitarFeriasView.tsx      (view = página)
├── VacationCard.tsx             (card = componente compartilhado)
└── VacationList.tsx             (list = componente compartilhado)

❌ EVITAR
├── VacationForm.tsx             (ambíguo - form ou page?)
├── SolicitarFerias.tsx          (qual é form? qual é view?)
└── RhTaskForm.tsx               (genérico demais)
```

---

## Checklist: Organização Correta

- [ ] Cada formulário é um arquivo separado
- [ ] Nome do arquivo descreve o tipo: `*Form.tsx` ou `*View.tsx`
- [ ] Forms em `components/forms/`
- [ ] Views em `components/views/`
- [ ] Componentes compartilhados em `components/shared/`
- [ ] View renderiza Forms (não o contrário)
- [ ] Form não conhece a View que o renderiza
- [ ] Tipos separados por arquivo
- [ ] Cada arquivo tem uma responsabilidade clara
- [ ] Routes.json aponta para Views, não Forms

---

## Lembre-se

**FORM** = Responsabilidade: Dados  
**VIEW** = Responsabilidade: Layout + Página  
**SHARED** = Responsabilidade: Reutilização
