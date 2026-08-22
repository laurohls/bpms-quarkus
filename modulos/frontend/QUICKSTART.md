# 🚀 GUIA RÁPIDO: MASTER FRONTEND

## O que foi criado?

Um **template frontend master** em `modulos/frontend/` que serve como base padrão para todos os módulos BPMS:

```
modulos/frontend/
├── src/
│   ├── App.tsx          ← Componente principal com layout padrão
│   ├── App.css          ← Estilos CSS base (sidebar, header, main)
│   ├── main.tsx         ← Entry point React
│   └── index.css        ← Variáveis CSS globais
├── public/
│   ├── branding/        ← Assets e identidade visual
│   ├── favicon.svg
│   └── icons.svg
├── Dockerfile           ← Build multi-stage Node + Nginx
├── nginx.conf           ← SPA routing configurado
├── package.json         ← React, Router, Axios, BPMN.js
├── vite.config.ts       ← Build tool config
├── tsconfig.json        ← TypeScript config
├── .dockerignore
└── README.md
```

## 📐 Arquitetura do Layout

```
┌─────────────────────────────────────────────────────┐
│  .app-shell                                          │
├──────────────────┬─────────────────────────────────┤
│                  │                                   │
│  .sidebar        │  .main-content                   │
│  ──────────────  │  ─────────────────────────────   │
│  • B[icon]       │  .page-header                    │
│  • BPMS Master   │  ┌──────────────────────────┐   │
│  • v1.0.0        │  │ Painel                   │   │
│                  │  │ ─────────────────────    │   │
│  ──────────────  │  │ Bem-vindo                │   │
│  📊 Painel       │  │ ••••• Conectado          │   │
│  ✓ Tarefas       │  └──────────────────────────┘   │
│  🔄 Processos    │                                   │
│  ⚙️ Config       │  Conteúdo específico do módulo   │
│                  │  ────────────────────────────    │
│  ──────────────  │  • Formulários                   │
│  👤 User Avatar  │  • Listas                        │
│  Carlos Mendes   │  • Gráficos                      │
│  Gestor          │  • etc...                        │
│                  │                                   │
│  Alternar User ▼ │                                   │
│  [Gestor]        │                                   │
│                  │                                   │
└──────────────────┴─────────────────────────────────┘
```

## 🎨 O que está pronto

✅ **Layout Padrão**
- Sidebar com navegação
- Main content area
- Page header com title + subtítulo
- User context com alternância de roles

✅ **Componentes Reutilizáveis**
- `Sidebar` — navegação e user card
- `PageHeader` — título e status
- `MainContent` — área principal
- `CurrentUserProvider` — context de usuário

✅ **Estilos Base**
- Variáveis CSS (`--bpms-blue`, `--bpms-navy`, etc)
- Responsive design
- Tema consistente

✅ **Infraestrutura**
- Vite + React 19 + Router 7
- TypeScript com strict mode
- Dockerizado com Nginx
- SPA routing configurado

✅ **Documentação**
- `README.md` — overview e quick start
- `HERANCA.md` — como outros módulos herdam

## 📦 Próximos Passos

### 1️⃣ Inicializar localmente

```bash
cd modulos/frontend
npm install
npm run dev
```

Acesse `http://localhost:3002` para ver o layout em ação.

### 2️⃣ Criar novo módulo que herda

```bash
# Ex: Novo módulo de "Aprovação de Despesas"
cp -r modulos/frontend processos/aprovacao-despesas/frontend
cd processos/aprovacao-despesas/frontend

# Customizar
# - package.json (name, description)
# - App.tsx (adicionar lógica específica)
# - App.css (adicionar estilos)
# - Adicionar componentes em src/components/
```

### 3️⃣ Integrar com docker-compose.yml

Adicionar novo serviço (ex):

```yaml
frontend-despesas:
  build: ./processos/aprovacao-despesas/frontend
  ports:
    - "3003:80"
  environment:
    - VITE_API_URL=http://motor:8080
```

## 💡 Conceitos-Chave

### CurrentUserProvider + useCurrentUser()

```typescript
// Disponível em qualquer componente
const { user, users, switchUser } = useCurrentUser()

// user: { id, name, role, initials }
// users: array de todos os usuários
// switchUser(id): alterna usuário ativo
```

### Routing

```typescript
// Baseado em location.pathname
const view = path.startsWith('/processos')
  ? 'process'
  : path.startsWith('/tarefas')
    ? 'tasks'
    : 'dashboard'
```

Rotas padrão:
- `/` → Dashboard
- `/tarefas` → Tasks
- `/processos` → Process
- `/configuracoes` → Settings

### Variáveis CSS Globais

```css
/* Definidas em src/index.css */
:root {
  --bpms-blue: #004f9f;
  --bpms-navy: #0a192f;
  --bpms-white: #ffffff;
  --bpms-content: #f4f7f6;
  --bpms-line: #d9e1d9;
  --bpms-text: #1a2332;
  --bpms-muted: #77827b;
}
```

Usar em estilos: `border-color: var(--bpms-line);`

## 🔍 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Estrutura principal + componentes |
| `src/App.css` | Estilos do layout |
| `src/index.css` | Tema global |
| `vite.config.ts` | Config Vite (porta 3002) |
| `Dockerfile` | Build multi-stage |
| `nginx.conf` | SPA routing + cache |
| `HERANCA.md` | Guia de herança para novos módulos |

## ⚠️ Notas Importantes

1. **Não é específico de negócio** — Apenas layout + componentes base
2. **Modular** — Cada projeto herda e customiza conforme necessário
3. **TypeScript strict** — Tipagem completa obrigatória
4. **Responsivo** — Media queries para mobile já incluídas
5. **Docker-ready** — Pronto para produção em container

## 🎯 Comparação: Master vs. Módulos

### Master (`modulos/frontend`)
- ✅ Layout genérico
- ✅ Componentes reutilizáveis
- ✅ Estilos base
- ✅ Configuração build
- ❌ Nenhuma lógica de negócio
- ❌ Sem dados específicos

### Módulo (ex: `socilitacao-ferias/frontend`)
- ✅ Herda layout do master
- ✅ Adiciona lógica específica
- ✅ Customiza componentes
- ✅ Estende estilos
- ✅ Integra com API específica
- ✅ Formulários e workflows próprios

---

**Estrutura pronta para escalabilidade!** 🚀
