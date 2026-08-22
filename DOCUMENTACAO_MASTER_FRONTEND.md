# 📚 Documentação: Master Frontend com Roteamento Dinâmico

## 🎯 Começar Aqui

### Para Entender a Arquitetura
**Tempo: 10 minutos**

Leia na seguinte ordem:

1. **[RESUMO_NOVA_ARQUITETURA.md](./RESUMO_NOVA_ARQUITETURA.md)** (7min)
   - O que mudou, por quê, e benefícios práticos
   - Comparativos antes vs depois
   - Casos de uso reais

2. **[ARQUITETURA_NOVA_MASTER_PROJETO.md](./ARQUITETURA_NOVA_MASTER_PROJETO.md)** (15min)
   - Visão geral da estrutura master vs projeto
   - Como projetos usam master (6 exemplos)
   - Padrão completo de herança

### Para Implementar
**Tempo: 2 horas para um projeto novo**

Siga este guia:

3. **[GUIA_REFATORACAO_NOVO_PADRAO.md](./GUIA_REFATORACAO_NOVO_PADRAO.md)** (Passo-a-passo)
   - Etapa 1-2: Criar `routes.json` e organizar componentes
   - Etapa 3-4: Novo `App.tsx` e `App.css`
   - Etapa 5-9: Validar, build, deploy
   - Exemplos de código para cada componente

## 📖 Documentação Técnica

### Master Frontend

- **[modulos/frontend/README.md](./modulos/frontend/README.md)** — Overview do master
  - Estrutura de pastas
  - Exports disponíveis
  - Como rodar localmente

- **[modulos/frontend/QUICKSTART.md](./modulos/frontend/QUICKSTART.md)** — Setup rápido
  
- **[modulos/frontend/HERANCA.md](./modulos/frontend/HERANCA.md)** — Explicação de herança

### Projetos (Exemplo: Férias)

- **[processos/socilitacao-ferias/frontend/](./processos/socilitacao-ferias/frontend/)** — Será refatorado
  - Após refatoração, terá: `routes.json` + componentes específicos

## 🏗️ Estrutura Geral

```
Master (modulos/frontend/) = Sistema Completo
├─ Componentes genéricos
├─ Services (API client)
├─ Hooks reutilizáveis
├─ Types centralizados
├─ Utils (roteamento dinâmico)
└─ CSS base com variáveis

Projeto Férias = Apenas Configuração + Lógica
├─ routes.json
├─ components/ (específicos)
├─ App.tsx (lê routes.json)
└─ App.css (estende master)

Projeto X = Apenas Configuração + Lógica
├─ routes.json
├─ components/ (específicos)
├─ App.tsx (lê routes.json)
└─ App.css (estende master)
```

## 🚀 Fluxo de Trabalho

### Criar Novo Processo

```bash
# 1. Copiar estrutura básica
mkdir processos/novo-processo/frontend
cp routes-template.json processos/novo-processo/frontend/src/

# 2. Editar routes.json
# - Mudar basePath
# - Definir rotas e componentes

# 3. Criar componentes específicos
# src/components/ComponenteA.tsx
# src/components/ComponenteB.tsx

# 4. Copiar App.tsx de exemplo e adaptar

# 5. Testar
cd processos/novo-processo/frontend
npm install
npm run dev
```

### Atualizar Master

Quando precisa adicionar novo hook, service ou component genérico:

```bash
# 1. Implementar em modulos/frontend/src/
# - Novo hook em src/hooks/index.ts
# - Novo service em src/services/api.ts
# - Nova type em src/types/index.ts

# 2. Re-exportar em App.tsx
export { novoHook } from './hooks'

# 3. Todos os projetos herdam automaticamente!
```

## 📋 Checklist para Novo Projeto

- [ ] Pasta criada em `processos/novo-processo/frontend/`
- [ ] `routes.json` criado e validado
- [ ] `App.tsx` criado usando template
- [ ] Componentes específicos implementados
- [ ] `App.css` contém apenas estilos específicos
- [ ] `package.json` com `"bpms-frontend-master": "file:../../modulos/frontend"`
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` funciona sem erros
- [ ] Menu renderiza de `routes.json`
- [ ] Navegação entre rotas funciona
- [ ] Temas CSS herdados do master aplicados

## 🔧 Troubleshooting

### "routes.json não encontrado"
```typescript
// App.tsx
loadProjectRoutes('./src/routes.json') // Caminho relativo
// ou
loadProjectRoutes('../routes.json') // Dependendo de onde executa
```

### "Componente não renderiza"
1. Verificar se componente está em `COMPONENT_MAP`
2. Verificar se `component` em routes.json corresponde
3. Verificar imports

### "Estilos master não aparecem"
```css
/* App.css do projeto */
/* Variáveis master são herdadas automaticamente */
.meu-componente {
  color: var(--bpms-blue); /* Vem do master */
}
```

## 📊 Exemplos Práticos

### Usar useApi Hook
```typescript
import { useApi } from 'bpms-frontend-master'

function TaskList() {
  const { data: tasks, loading, error } = useApi('/api/tasks')
  
  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  
  return (
    <ul>
      {tasks?.map(t => <li key={t.id}>{t.name}</li>)}
    </ul>
  )
}
```

### Usar useMutation Hook
```typescript
import { useMutation } from 'bpms-frontend-master'

function CreateTask() {
  const { execute: create, loading } = useMutation('post')
  
  const handleSubmit = async (data) => {
    const response = await create('/api/tasks', data)
    if (response.success) {
      alert('Tarefa criada!')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Acessar User Context
```typescript
import { useCurrentUser } from 'bpms-frontend-master'

function UserProfile() {
  const { user, switchUser } = useCurrentUser()
  
  return (
    <div>
      <p>Usuário: {user.name}</p>
      <select onChange={(e) => switchUser(e.target.value)}>
        {/* ... */}
      </select>
    </div>
  )
}
```

## 🎓 Conceitos-Chave

### 1. Routes.json é a Configuração
Não é roteamento React tradicional. É uma configuração declarativa que:
- Define menu
- Define quais componentes renderizar
- Permite roteamento dinâmico sem hardcode

### 2. Master é a Biblioteca
Não é apenas layout. É uma biblioteca completa:
- Componentes (Sidebar, PageHeader)
- Services (apiClient)
- Hooks (useApi, useMutation)
- Utilities (loadProjectRoutes)

### 3. Projeto é Apenas Lógica
Projeto não duplica nada do master:
- Não tem seu próprio apiClient
- Não tem seu próprio useCurrentUser
- Importa tudo do master, estende com específico

## 📞 Quando Pedir Ajuda

### ✅ Master deve ter:
- Componentes genéricos (Sidebar, PageHeader)
- Services genéricos (apiClient)
- Hooks que qualquer projeto pode usar
- Types compartilhados
- CSS com variáveis base

### ❌ Master NÃO deve ter:
- Formulários específicos (VacationForm, etc)
- Hooks específicos de processo (useVacationData)
- Lógica de negócio
- Componentes de domínio

### Se está em dúvida:
**Pergunta**: "Isso seria útil em outro processo?"
- **Sim** → Colocar no master
- **Não** → Colocar no projeto

## 🎯 Próximas Fases

1. ✅ Master refatorado com nova arquitetura
2. 🔜 Refatorar projeto Férias (usar GUIA_REFATORACAO_NOVO_PADRAO.md)
3. 🔜 Testar roteamento dinâmico end-to-end
4. 🔜 Criar 2-3 novos processos usando novo padrão
5. 🔜 Documentar lições aprendidas

---

**Última atualização**: 2026-08-22  
**Versão**: Master Frontend com Roteamento Dinâmico JSON v1.0
