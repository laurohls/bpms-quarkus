# ✅ ATUALIZAÇÃO: Padrão de Formulários Individuais

## Mudança Importante

Você deixou claro: **Cada formulário deve ser criado individualmente**, não um componente genérico que tenta lidar com todos.

---

## O Padrão Correto

### ❌ ERRADO (Não fazer!)
```typescript
// components/RhTaskForm.tsx - Componente genérico
export default function RhTaskForm({ taskType, taskId }) {
  if (taskType === 'solicitar') return <SolicitarUI />
  if (taskType === 'analisar') return <AnalisarUI />
  if (taskType === 'validar') return <ValidarUI />
  if (taskType === 'cancelar') return <CancelarUI />
  // Muito complexo, muitas responsabilidades!
}
```

### ✅ CORRETO (Fazer assim!)
```typescript
// components/forms/SolicitarFeriasForm.tsx
export default function SolicitarFeriasForm() { ... }

// components/forms/AnalisarSolicitacaoForm.tsx
export default function AnalisarSolicitacaoForm() { ... }

// components/forms/ValidarGestorForm.tsx
export default function ValidarGestorForm() { ... }

// components/forms/CancelarFeriasForm.tsx
export default function CancelarFeriasForm() { ... }
```

---

## Documentação Criada

Dois novos documentos explicam o padrão em detalhes:

### 1. [PADRAO_FORMULARIOS_INDIVIDUAIS.md](./PADRAO_FORMULARIOS_INDIVIDUAIS.md)
**Guia Completo de Formulários Individuais**

Contém:
- ✅ Estrutura recomendada de pastas
- ✅ Exemplo completo de cada formulário (SolicitarFeriasForm, AnalisarSolicitacaoForm, etc)
- ✅ Como usar em App.tsx
- ✅ Como adicionar novo formulário (checklist)

### 2. [FORMULARIOS_VS_VIEWS.md](./FORMULARIOS_VS_VIEWS.md)
**Diferença entre Formulários e Views**

Explica:
- 📋 O que é uma View (página)
- 📝 O que é um Formulário (form)
- 🎯 Quando usar cada um
- 📊 Estrutura completa recomendada
- 🔄 Fluxo: View → Form

---

## Estrutura Recomendada para Férias

```
processos/socilitacao-ferias/frontend/src/components/

├── forms/                                 # 🔵 Formulários individuais
│   ├── SolicitarFeriasForm.tsx           # Servidor solicita
│   ├── AnalisarSolicitacaoForm.tsx       # RH aprova/rejeita
│   ├── ValidarGestorForm.tsx             # Gestor valida
│   └── CancelarFeriasForm.tsx            # Cancela férias
│
├── views/                                 # 🟢 Páginas/Views
│   ├── SolicitarFeriasView.tsx           # Page que usa SolicitarFeriasForm
│   ├── AnalisarSolicitacoesView.tsx      # Page que usa AnalisarSolicitacaoForm
│   ├── MinhasSolicitacoesView.tsx        # Page com lista
│   └── DashboardFeriasView.tsx           # Page com dashboard
│
├── shared/                                # 🟡 Componentes reutilizáveis
│   ├── VacationCard.tsx                  # Card que exibe solicitation
│   ├── SolicitacoesList.tsx              # Lista de solicitações
│   └── StatusBadge.tsx                   # Badge com status
│
└── styles/                                # Estilos por feature
    ├── solicitar-ferias.css
    ├── analisar-solicitacoes.css
    └── minhas-solicitacoes.css
```

---

## Exemplo: Como Usar

### routes.json
```json
{
  "basePath": "/processos/ferias",
  "routes": [
    {
      "name": "Solicitar Férias",
      "path": "/solicitar",
      "component": "SolicitarFeriasView",
      "icon": "📝"
    },
    {
      "name": "Analisar",
      "path": "/analisar/:id",
      "component": "AnalisarSolicitacaoForm",
      "icon": "_"
    }
  ]
}
```

### App.tsx
```typescript
import SolicitarFeriasView from './components/views/SolicitarFeriasView'
import AnalisarSolicitacaoForm from './components/forms/AnalisarSolicitacaoForm'

const COMPONENT_MAP = {
  SolicitarFeriasView,
  AnalisarSolicitacaoForm,
  // ... outros
}
```

### SolicitarFeriasView.tsx
```typescript
// Página que renderiza o formulário
import { PageHeader } from 'bpms-frontend-master'
import SolicitarFeriasForm from '../forms/SolicitarFeriasForm'

export default function SolicitarFeriasView() {
  return (
    <div>
      <PageHeader title="Solicitar Férias" />
      <SolicitarFeriasForm />
    </div>
  )
}
```

### SolicitarFeriasForm.tsx
```typescript
// Formulário individual - apenas responsável por coletar dados
import { useState } from 'react'
import { useCurrentUser, useMutation } from 'bpms-frontend-master'

export default function SolicitarFeriasForm() {
  const { user } = useCurrentUser()
  const { execute: submit, loading } = useMutation('post')
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit('/api/vacation-requests', { userId: user.id, ...form })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Benefícios do Padrão Individual

| Benefício | Exemplo |
|-----------|---------|
| **Responsabilidade Única** | SolicitarFeriasForm só pede férias |
| **Fácil Testar** | Testa um formulário por vez |
| **Reutilizável** | Form pode usar em View, Modal, Drawer |
| **Manutenível** | Mudança em um form não afeta outro |
| **Escalável** | Novo form = novo arquivo |
| **Type-Safe** | Cada form tem seus próprios types |
| **Nomes Claros** | Arquivo diz exatamente o que faz |

---

## Checklist: Formulário Individual

- [ ] Arquivo com nome descritivo: `*Form.tsx`
- [ ] JSDoc explicando quem usa e por quê
- [ ] Type definido para dados: `[NomeForm]Data`
- [ ] Usa `useCurrentUser` para saber quem está usando
- [ ] Usa `useMutation` para enviar ao motor
- [ ] Estados: loading, error, success
- [ ] Validação nos inputs
- [ ] Mensagens de erro/sucesso
- [ ] Acessibilidade: labels, IDs, disabled
- [ ] Exportado como default
- [ ] Adicionado ao COMPONENT_MAP
- [ ] Rota em routes.json aponta para View, não Form
- [ ] View renderiza o Form

---

## Padrão de Nomes

```
✅ CORRETO
├── SolicitarFeriasForm.tsx      # Form individual
├── SolicitarFeriasView.tsx      # View/Page
├── AnalisarSolicitacaoForm.tsx  # Form individual
├── AnalisarSolicitacoesView.tsx # View/Page
└── VacationCard.tsx             # Componente compartilhado

❌ EVITAR
├── RhTaskForm.tsx               # Genérico demais
├── Form.tsx                     # Sem contexto
├── VacationForm.tsx             # Ambíguo
└── SolicitarFerias.tsx          # Qual é form? View?
```

---

## Resumo das Mudanças

**Antes (Errado):**
- Um componente `RhTaskForm` genérico que tenta fazer tudo
- Lógica de múltiplos formulários misturada
- Difícil de manter e testar

**Depois (Correto):**
- Componente individual para cada formulário
- Responsabilidade única e clara
- Fácil de manter, testar e reutilizar

---

## Documentação de Referência

1. **[PADRAO_FORMULARIOS_INDIVIDUAIS.md](./PADRAO_FORMULARIOS_INDIVIDUAIS.md)** - Exemplos completos de código
2. **[FORMULARIOS_VS_VIEWS.md](./FORMULARIOS_VS_VIEWS.md)** - Estrutura e organização
3. **[GUIA_REFATORACAO_NOVO_PADRAO.md](./GUIA_REFATORACAO_NOVO_PADRAO.md)** - Atualizado com novo padrão

---

## Próximas Etapas

Ao refatorar Férias:

1. ✅ Criar `components/forms/` com cada formulário individual
2. ✅ Criar `components/views/` com pages
3. ✅ Criar `components/shared/` com componentes reutilizáveis
4. ✅ Adicionar rotas em `routes.json`
5. ✅ Implementar em `App.tsx`
6. ✅ Testar: `npm run dev`

---

**Versão**: Padrão de Formulários Individuais v1.0  
**Data**: 2026-08-22  
**Status**: ✅ Documentado e Pronto para Implementação
