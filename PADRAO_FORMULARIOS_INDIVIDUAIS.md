# 🎯 Padrão de Formulários: Componentes Individuais

## Princípio Fundamental

**Cada formulário = Um componente separado**

Não use um componente `RhTaskForm` genérico que tenta lidar com todos os formulários. Em vez disso, crie componentes específicos para cada tipo de formulário.

---

## Estrutura para Projeto Férias

```
processos/socilitacao-ferias/frontend/src/
├── components/
│   ├── forms/                          # ← Pasta para formulários
│   │   ├── SolicitarFeriasForm.tsx    # Servidor solicita férias
│   │   ├── AnalisarSolicitacaoForm.tsx # RH analisa/aprova
│   │   ├── ValidarGestorForm.tsx       # Gestor valida
│   │   └── CancelarFeriasForm.tsx      # Cancelar férias existente
│   ├── views/                          # Páginas/Views
│   │   ├── SolicitarFerias.tsx        # Page: Solicitar
│   │   ├── AnalisarSolicitacoes.tsx   # Page: Analisar (RH)
│   │   ├── ValidarSolicitacoes.tsx    # Page: Validar (Gestor)
│   │   └── MinhasSolicitacoes.tsx     # Page: Minhas solicitações
│   └── shared/                         # Componentes compartilhados
│       └── VacationCard.tsx           # Card de exibição
├── hooks/
│   └── useFeriaData.ts                # Hook específico de férias
├── types/
│   └── ferias.ts                      # Types de férias
├── routes.json                        # Configuração
├── App.tsx                            # Entry point
└── App.css
```

---

## Padrão: Cada Formulário Independente

### 1. SolicitarFeriasForm.tsx

```typescript
/**
 * Formulário para SERVIDOR solicitar férias
 * - Accessible to: Servidor/Colaborador
 * - Action: Criar nova solicitação de férias
 */

import { useState } from 'react'
import { useCurrentUser, useMutation, PageHeader } from 'bpms-frontend-master'

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
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await submit('/api/vacation-requests', {
      employeeId: user.id,
      employeeName: user.name,
      ...formData,
    })
    if (response.success) {
      setSuccess(true)
      setFormData({ startDate: '', endDate: '', reason: '' })
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div>
      <PageHeader title="Solicitar Férias" subtitle="Preencha os dados abaixo" />
      
      {success && (
        <div className="alert alert-success">
          ✓ Solicitação enviada com sucesso!
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          ✗ Erro: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ferias-form">
        <div className="form-group">
          <label htmlFor="startDate">Data de Início *</label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Data de Término *</label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Motivo (opcional)</label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Descreva o motivo da solicitação..."
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Solicitar Férias'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 2. AnalisarSolicitacaoForm.tsx

```typescript
/**
 * Formulário para RH analisar e aprovar/rejeitar solicitação
 * - Accessible to: RH/Admin
 * - Action: Análise com parecer e decisão
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi, useMutation, PageHeader, useCurrentUser } from 'bpms-frontend-master'

export type AnalisarSolicitacaoFormData = {
  decision: 'approved' | 'rejected'
  comment: string
}

type Solicitacao = {
  id: string
  employeeName: string
  startDate: string
  endDate: string
  reason?: string
}

export default function AnalisarSolicitacaoForm() {
  const { id } = useParams<{ id: string }>()
  const { user } = useCurrentUser()
  const { data: solicitacao } = useApi<Solicitacao>(`/api/vacation-requests/${id}`)
  const { execute: submit, loading } = useMutation('put')

  const [formData, setFormData] = useState<AnalisarSolicitacaoFormData>({
    decision: 'approved',
    comment: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await submit(`/api/vacation-requests/${id}/analyze`, {
      ...formData,
      analyzedBy: user.name,
      analyzedAt: new Date().toISOString(),
    })
    if (response.success) {
      alert('Análise registrada com sucesso!')
    }
  }

  if (!solicitacao) return <div>Carregando...</div>

  return (
    <div>
      <PageHeader 
        title="Analisar Solicitação" 
        subtitle={`Servidor: ${solicitacao.employeeName}`}
      />

      <div className="solicitacao-summary">
        <div className="summary-item">
          <strong>Período:</strong>
          <span>{solicitacao.startDate} até {solicitacao.endDate}</span>
        </div>
        {solicitacao.reason && (
          <div className="summary-item">
            <strong>Motivo:</strong>
            <span>{solicitacao.reason}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="analise-form">
        <div className="form-group">
          <label htmlFor="decision">Decisão *</label>
          <select
            id="decision"
            value={formData.decision}
            onChange={(e) => setFormData({ ...formData, decision: e.target.value as any })}
            disabled={loading}
          >
            <option value="approved">✓ Aprovar</option>
            <option value="rejected">✗ Rejeitar</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Parecer/Comentário *</label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Descreva o parecer..."
            required
            disabled={loading}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => window.history.back()}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Registrar Análise'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 3. ValidarGestorForm.tsx

```typescript
/**
 * Formulário para GESTOR validar solicitação já aprovada por RH
 * - Accessible to: Gestor (Manager)
 * - Action: Validação final com parecer gerencial
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi, useMutation, PageHeader } from 'bpms-frontend-master'

export type ValidarGestorFormData = {
  validated: boolean
  gestorComment: string
  operationalImpact?: string
}

export default function ValidarGestorForm() {
  const { id } = useParams<{ id: string }>()
  const { data: solicitacao } = useApi(`/api/vacation-requests/${id}`)
  const { execute: submit, loading } = useMutation('put')

  const [formData, setFormData] = useState<ValidarGestorFormData>({
    validated: true,
    gestorComment: '',
    operationalImpact: 'low',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit(`/api/vacation-requests/${id}/validate-gestor`, formData)
  }

  return (
    <div>
      <PageHeader title="Validar Solicitação (Gestor)" />

      <form onSubmit={handleSubmit} className="validacao-form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.validated}
              onChange={(e) => setFormData({ ...formData, validated: e.target.checked })}
              disabled={loading}
            />
            Validar esta solicitação?
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="operationalImpact">Impacto Operacional</label>
          <select
            id="operationalImpact"
            value={formData.operationalImpact}
            onChange={(e) => setFormData({ ...formData, operationalImpact: e.target.value })}
            disabled={loading}
          >
            <option value="low">Baixo</option>
            <option value="medium">Médio</option>
            <option value="high">Alto</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comentário do Gestor</label>
          <textarea
            id="comment"
            value={formData.gestorComment}
            onChange={(e) => setFormData({ ...formData, gestorComment: e.target.value })}
            placeholder="Observações gerenciais..."
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Validar'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 4. CancelarFeriasForm.tsx

```typescript
/**
 * Formulário para cancelar uma solicitação de férias já aprovada
 * - Accessible to: Servidor ou RH
 * - Action: Cancelamento com justificativa
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi, useMutation, PageHeader } from 'bpms-frontend-master'

export type CancelarFeriasFormData = {
  cancellationReason: string
  force?: boolean
}

export default function CancelarFeriasForm() {
  const { id } = useParams<{ id: string }>()
  const { data: solicitacao } = useApi(`/api/vacation-requests/${id}`)
  const { execute: submit, loading } = useMutation('put')
  const [confirmed, setConfirmed] = useState(false)

  const [formData, setFormData] = useState<CancelarFeriasFormData>({
    cancellationReason: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmed) {
      alert('Você deve confirmar o cancelamento')
      return
    }
    const response = await submit(`/api/vacation-requests/${id}/cancel`, formData)
    if (response.success) {
      alert('Férias canceladas com sucesso')
    }
  }

  return (
    <div>
      <PageHeader 
        title="Cancelar Férias" 
        subtitle="Esta ação não pode ser desfeita"
        rightContent={<span className="text-warning">⚠️ Operação Irreversível</span>}
      />

      <form onSubmit={handleSubmit} className="cancelamento-form">
        <div className="alert alert-warning">
          <strong>Aviso:</strong> O cancelamento de férias é irreversível. 
          Certifique-se antes de prosseguir.
        </div>

        <div className="form-group">
          <label htmlFor="reason">Motivo do Cancelamento *</label>
          <textarea
            id="reason"
            value={formData.cancellationReason}
            onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
            placeholder="Justifique o motivo do cancelamento..."
            required
            disabled={loading}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
            />
            Confirmo o cancelamento de férias
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => window.history.back()}
          >
            Voltar
          </button>
          <button
            type="submit"
            className="btn btn-danger"
            disabled={loading || !confirmed}
          >
            {loading ? 'Processando...' : 'Cancelar Férias'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## Como Usar em App.tsx

```typescript
import SolicitarFeriasForm from './components/forms/SolicitarFeriasForm'
import AnalisarSolicitacaoForm from './components/forms/AnalisarSolicitacaoForm'
import ValidarGestorForm from './components/forms/ValidarGestorForm'
import CancelarFeriasForm from './components/forms/CancelarFeriasForm'

const COMPONENT_MAP = {
  // Forms
  SolicitarFeriasForm,
  AnalisarSolicitacaoForm,
  ValidarGestorForm,
  CancelarFeriasForm,
  // Views
  // ...
}
```

**routes.json:**
```json
{
  "basePath": "/processos/ferias",
  "routes": [
    {
      "name": "Solicitar Férias",
      "path": "/solicitar",
      "component": "SolicitarFeriasForm",
      "icon": "📝"
    },
    {
      "name": "Analisar Solicitações",
      "path": "/analisar/:id",
      "component": "AnalisarSolicitacaoForm",
      "icon": "_"
    },
    {
      "name": "Validar (Gestor)",
      "path": "/validar/:id",
      "component": "ValidarGestorForm",
      "icon": "_"
    },
    {
      "name": "Cancelar Férias",
      "path": "/cancelar/:id",
      "component": "CancelarFeriasForm",
      "icon": "_"
    }
  ]
}
```

---

## Benefícios do Padrão Individual

✅ **Responsabilidade Única** — Cada componente faz uma coisa bem  
✅ **Fácil Testar** — Testa um formulário por vez  
✅ **Reutilizável** — Componentes podem ser usados em diferentes contextos  
✅ **Manutenível** — Mudança em um formulário não afeta outro  
✅ **Escalável** — Adicionar novo formulário é só criar novo arquivo  
✅ **Type-Safe** — Cada formulário tem seus próprios types  
✅ **Claro** — Nome do arquivo deixa óbvio o que o componente faz  

---

## Exemplo Prático: Adicionar Novo Formulário

Para adicionar "Solicitar Prorrogação de Férias":

```bash
# 1. Criar arquivo
touch src/components/forms/SolicitarProrrogacaoForm.tsx

# 2. Implementar (copiar template de SolicitarFeriasForm)

# 3. Adicionar ao COMPONENT_MAP em App.tsx

# 4. Adicionar rota em routes.json

# Pronto! 🎉
```

---

## Checklist para Cada Formulário

- [ ] Nome descritivo do arquivo (ex: SolicitarFeriasForm.tsx)
- [ ] JSDoc comentário explicando quem usa e por quê
- [ ] Type definido para os dados do formulário (ex: SolicitarFeriasFormData)
- [ ] useCurrentUser para saber quem está usando
- [ ] useMutation para enviar ao motor
- [ ] Estados: loading, error, success
- [ ] Validação básica nos inputs
- [ ] Mensagens de erro e sucesso
- [ ] Acessibilidade: labels, IDs, disabled state
- [ ] Exportado como default
- [ ] Adicionado ao COMPONENT_MAP
- [ ] Rota adicionada em routes.json
