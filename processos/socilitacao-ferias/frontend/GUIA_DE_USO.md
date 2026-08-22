# 🚀 GUIA DE USO - FÉRIAS FRONTEND

## ✅ Status Atual
- **Build:** ✅ Funcional (sem erros)
- **Estrutura:** ✅ Completa (master + project)
- **Rotas:** ✅ Configuradas (4 páginas)
- **Componentes:** ✅ Implementados (formulários + views)
- **Vendor:** ✅ Master vendorizado (build independente)

---

## 🎯 Como Usar

### 1. **Desenvolvimento Local**

```bash
cd processos/socilitacao-ferias/frontend

# Instalar dependências (já feito)
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Acessar: http://localhost:3002
```

**O que você verá:**
- Menu com 4 itens: Solicitar Férias, Minhas Solicitações, Tarefas, Processos
- Layout master herdado (Sidebar + PageHeader + AppFooter)
- CSS variables aplicados
- Rotas configuradas dinamicamente

### 2. **Build para Produção**

```bash
cd processos/socilitacao-ferias/frontend

# Compilar para produção
npm run build

# Resultado: pasta dist/ com arquivos otimizados
# - index.html (aplicação HTML)
# - assets/index-*.js (JavaScript bundle)
# - assets/index-*.css (CSS bundle)
# - assets SVGs e ícones
```

### 3. **Preview do Build**

```bash
# Servir localmente o build de produção
npm run preview

# Acessar: http://localhost:5173 (ou próxima porta disponível)
```

### 4. **Type Checking**

```bash
# Validar tipos TypeScript sem compilar
npm run type-check

# Útil para CI/CD
```

---

## 📂 Estrutura de Arquivos

```
processos/socilitacao-ferias/frontend/
├── src/
│   ├── vendor/master/          ← Master copiado (vendorizado)
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── components/             ← Específico do Projeto Férias
│   │   ├── forms/              ← Formulários específicos
│   │   │   ├── SolicitarFeriasForm.tsx
│   │   │   ├── AnalisarSolicitacaoForm.tsx
│   │   │   ├── ValidarGestorForm.tsx
│   │   │   └── CancelarFeriasForm.tsx
│   │   ├── views/              ← Páginas/Views
│   │   │   ├── SolicitarFeriasView.tsx
│   │   │   ├── TaskListView.tsx
│   │   │   ├── TaskDetailView.tsx
│   │   │   ├── MinhasSolicitacoesView.tsx
│   │   │   └── ProcessosView.tsx
│   │   └── shared/             ← Componentes reutilizáveis locais
│   │       └── TaskCard.tsx
│   │
│   ├── types/                  ← Tipos específicos do Férias
│   │   └── index.ts
│   │
│   ├── utils/                  ← Utilitários do Férias
│   │   └── dateHelpers.ts
│   │
│   ├── routes.json             ← Configuração de rotas
│   ├── App.tsx                 ← Componente raiz
│   ├── App.css                 ← Estilos da aplicação
│   ├── main.tsx                ← Entry point
│   └── index.css               ← Global CSS
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── branding/               ← Assets do governo
│
├── dist/                       ← Build de produção (gerado)
│   ├── index.html
│   ├── assets/
│   ├── favicon.svg
│   └── ...
│
├── vite.config.ts              ← Configuração Vite
├── tsconfig.json               ← Configuração TypeScript
├── tsconfig.app.json           ← App-specific TypeScript config
├── package.json                ← Dependências
├── Dockerfile                  ← Para containerização
├── nginx.conf                  ← Config Nginx (SPA routing)
└── .gitignore
```

---

## 🔗 Integração com Backend

### Configurar URL da API

```bash
# .env.local (desenvolvimento)
VITE_API_URL=http://localhost:8080/api

# ou em produção via Docker
docker run -e VITE_API_URL=http://api.exemplo.com bpms-ferias:1.0
```

### Endpoints Esperados

```
POST /api/solicitations/                    # Criar nova solicitação
GET  /api/solicitations/                    # Listar solicitações
GET  /api/solicitations/{id}                # Detalhes da solicitação
PUT  /api/solicitations/{id}                # Atualizar solicitação
DELETE /api/solicitations/{id}              # Cancelar solicitação

GET  /api/tasks/                            # Listar tarefas
GET  /api/tasks/{id}                        # Detalhes da tarefa
POST /api/tasks/{id}/claim                  # Reivindicar tarefa
POST /api/tasks/{id}/complete               # Completar tarefa
```

---

## 🐳 Docker & Deployment

### Build Docker

```bash
cd processos/socilitacao-ferias/frontend

# Build da imagem
docker build -t bpms-ferias:1.0 .

# Executar container
docker run -d -p 80:80 -e VITE_API_URL=http://api:8080 --name bpms-ferias bpms-ferias:1.0

# Acessar: http://localhost
```

### Docker Compose

```yaml
version: '3'
services:
  ferias-frontend:
    build: ./processos/socilitacao-ferias/frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://api:8080/api
    depends_on:
      - api
```

---

## 🧪 Testes & Validação

### 1. Validar Build

```bash
npm run build
# ✓ 189 modules transformed
# ✓ built in 230ms
```

### 2. Validar Tipos

```bash
npm run type-check
# Sem erros (ignorando erros do vendor)
```

### 3. Validar CSS

Abrir DevTools no navegador:
- Elementos do Sidebar carregados
- CSS variables (`--color-*`, `--spacing-*`) aplicados
- Layout responsivo

### 4. Validar Rotas

Console deve mostrar:
```javascript
> Routes loaded from routes.json:
> Menu built from routes.json with 4 items
```

---

## 🔧 Personalizações

### Adicionar Nova Rota

1. Criar novo arquivo em `src/components/views/NovaView.tsx`
2. Adicionar em `src/routes.json`:
```json
{
  "path": "/nova",
  "name": "Nova Página",
  "component": "NovaView",
  "visible": true,
  "icon": "✨"
}
```
3. Menu atualiza automaticamente!

### Adicionar Novo Formulário

1. Criar arquivo em `src/components/forms/NovoForm.tsx`
2. Exportar tipo para `src/types/index.ts`
3. Usar em uma view:
```tsx
import NovoForm from '../forms/NovoForm'
export default function NovaView() {
  return <NovoForm />
}
```

### Personalizar Estilos

Editar `src/App.css`:
- Variables CSS já estão no master
- Adicionar classes específicas
- Mobile-first responsive design

---

## 🐛 Troubleshooting

### Erro: "Port 3002 already in use"
```bash
# Encerrar processos node
taskkill /PID <PID> /F

# Ou usar porta diferente
npm run dev -- --port 3003
```

### Erro: "Cannot find module 'bpms-frontend-master'"
- Vendor foi copiado para `src/vendor/master/`
- Vite resolve automaticamente via alias
- Reinstalar: `npm install`

### CSS não carrega
- Verificar se Master CSS é herdado via `@import` em App.css
- Verificar DevTools > Network > CSS
- Cache: `npm run build && npm run preview`

### Build fails
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📈 Performance

### Bundle Analysis

```bash
# Gerar relatório de bundle
npm run build -- --report

# Resultado:
# - index-*.js: 508.98 kB (154.80 kB gzipped)
# - index-*.css: 7.38 kB (1.82 kB gzipped)
```

### Otimizações Aplicadas

- [x] Code splitting via Vite
- [x] Minificação automática
- [x] Tree-shaking de imports não usados
- [x] CSS purgado
- [x] Assets otimizados (SVG, PNG)

### Melhorias Futuras

- Lazy loading de rotas (dynamic import)
- Image optimization
- Cache busting strategy
- Service Worker (PWA)

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Build & Deploy

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run type-check
```

### Deploy Stages

1. **Development**: `main` branch → deploy.dev.com
2. **Staging**: `release` branch → deploy.staging.com
3. **Production**: `v1.0.0` tag → deploy.com

---

## 📚 Documentação Relacionada

- [IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md) - Resumo completo
- [routes.json](./src/routes.json) - Configuração de rotas
- [vite.config.ts](./vite.config.ts) - Configuração build
- [tsconfig.app.json](./tsconfig.app.json) - TypeScript config

---

## 💡 Dicas Importantes

1. **Master é read-only para esse projeto**
   - Atualizações do master vêm do `modulos/frontend/src`
   - Copiar novamente se houver atualizações

2. **Tipos estão em dois lugares**
   - Master types: `src/vendor/master/types/`
   - Project types: `src/types/`
   - Não duplicar - reutilizar do master

3. **Services & Hooks também no master**
   - useApi, useMutation, useCurrentUser
   - useLocalStorage, useDebounce, usePrevious
   - Não reimplementar - reutilizar do master

4. **CSS é herdado**
   - App.css do master importado automaticamente
   - Variables CSS estão disponíveis
   - Adicionar apenas CSS específico do Férias

---

## 🎓 Próximos Passos

1. **Local Testing**
   - [ ] Iniciar `npm run dev`
   - [ ] Testar navegação entre páginas
   - [ ] Validar estilos CSS

2. **Backend Integration**
   - [ ] Conectar com API real
   - [ ] Testar formulários
   - [ ] Validar workflows

3. **Docker Deploy**
   - [ ] Build imagem Docker
   - [ ] Testar em container
   - [ ] Deploy em produção

4. **Novos Projetos**
   - [ ] Duplicar estrutura para Viagens
   - [ ] Duplicar estrutura para Equipamentos
   - [ ] Reutilizar master em ambos

---

*Documentação atualizada em 2024 - Frontend Férias v1.0.0*
