# 🆘 TROUBLESHOOTING GUIDE - Férias Frontend

## 🎯 Rápida Referência por Erro

### ❌ Erro: "SyntaxError: Unexpected token '<', "<!doctype""
**Causa:** routes.json não carregando, retorna HTML 404

**Solução:**
```bash
# Verificar se routes.json existe em public/
ls public/routes.json

# Se não existe, copiar:
cp src/routes.json public/routes.json

# Verificar App.tsx tem path correto:
# loadProjectRoutes('/routes.json')  ← começar com /

# Limpar cache e rebuild:
rm -rf .vite node_modules/.vite
npm run build
npm run dev
```

---

### ❌ Erro: "Cannot render <Router> inside another <Router>"
**Causa:** Múltiplas instâncias de BrowserRouter

**Solução:**
```tsx
// ❌ ERRADO - Em App.tsx:
<BrowserRouter>
  <Router> {/* já tem BrowserRouter! */}

// ✅ CERTO - Uma só:
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>
```

**Verificar:**
1. App.tsx tem `<BrowserRouter>`?
2. main.tsx ou main.tsx tem `<BrowserRouter>`?
3. Algum contexto wrapper tem router?

Manter UMA ÚNICA instância de BrowserRouter na raiz.

---

### ❌ Erro: "Port 3002 already in use"
**Causa:** Processo anterior ainda rodando

**Solução:**
```bash
# Opção 1: Usar porta diferente
npm run dev -- --port 3003

# Opção 2: Encontrar e matar processo
netstat -ano | findstr ":3002"
# Pega PID (última coluna)
taskkill /PID <PID> /F

# Opção 3: Esperar 30 segundos e tentar novamente
```

---

### ❌ Erro: "Cannot find module 'bpms-frontend-master'"
**Causa:** Vendor/master não copiado

**Solução:**
```bash
# Copiar master para vendor:
rm -rf src/vendor/master
cp -r ../../modulos/frontend/src src/vendor/master

# Reinstalar node_modules:
rm -rf node_modules package-lock.json
npm install

# Rebuild:
npm run build
```

**Verificar:**
```bash
# Deve existir:
ls src/vendor/master/components/
ls src/vendor/master/hooks/
ls src/vendor/master/services/
```

---

### ❌ Erro: "Cannot find module '../types' or '../utils/dateHelpers'"
**Causa:** Imports com path relativo errado (abrir/fechar um nível)

**Solução:**

Verificar profundidade:
```
src/
├── components/
│   └── forms/
│       └── SolicitarFeriasForm.tsx  ← AQUI (profundidade 3)
│
├── types/index.ts  ← precisa subir 2 níveis
└── utils/dateHelpers.ts  ← precisa subir 2 níveis
```

**Corretos:**
```tsx
import type { VacationFormData } from '../../types'         // ✓
import { daysBetween } from '../../utils/dateHelpers'      // ✓
```

**Incorretos:**
```tsx
import type { VacationFormData } from '../types'           // ✗
import { daysBetween } from '../utils/dateHelpers'         // ✗
```

---

### ❌ Erro: "CSS not applied"
**Causa:** CSS não importado ou order incorreta

**Solução:**

Verificar em App.tsx:
```tsx
import './App.css'  // ✓ Deve estar aqui

export default function App() {
  // Component render
}
```

Verificar App.css:
```css
/* Deve ter estilos globais */
:root {
  --color-primary: #007bff;
  /* ... */
}

.app-shell {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

Se vendor CSS não carregando:
```css
/* Em App.css, importar master */
@import url('./vendor/master/App.css');

/* Ou copiar variables do master */
```

---

### ❌ Erro: "Images/SVGs not found"
**Causa:** Assets em src/ não servidos

**Solução:**

Mover para public/:
```bash
# ✗ src/assets/logo.svg
# ✓ public/logo.svg
```

Referenciar em HTML:
```tsx
// ✗ ERRADO:
<img src={`/logo.svg`} />  // será /logo.svg

// ✓ CERTO:
<img src="/branding/logomarca-detran.svg" />
```

---

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Build
```bash
npm run build
# ✓ Sem erros? Vá para 2
# ✗ Com erros? Leia stack trace e procure acima
```

### 2. Verificar estrutura
```bash
# Existem todos esses arquivos?
[ -f public/routes.json ] && echo "✓ routes.json"
[ -d src/vendor/master ] && echo "✓ vendor/master"
[ -f src/App.tsx ] && echo "✓ App.tsx"
[ -f src/types/index.ts ] && echo "✓ types"
```

### 3. Verificar imports
```bash
# Verificar arquivo com erro:
grep -n "^import" src/components/forms/SolicitarFeriasForm.tsx

# Todos começam com 'bpms-frontend-master', '../../', ou './'?
# Não tem '../../../'? (muitos níveis)
```

### 4. Testar Dev Server
```bash
npm run dev 2>&1 | tee dev.log

# Abrir DevTools:
# F12 → Console
# Procurar por erros vermelhos
# Expandir stack traces
```

### 5. Verificar Network
DevTools → Network:
- [ ] routes.json carrega? (200 OK)
- [ ] CSS carrega? (200 OK)
- [ ] JS carrega? (200 OK)
- [ ] Erros 404?

---

## 🧰 Limpeza & Reset

### Limpar Cache Vite
```bash
rm -rf .vite
rm -rf node_modules/.vite
npm run build  # vai recriar cache
```

### Limpar Tudo
```bash
rm -rf node_modules
rm -rf dist
rm package-lock.json
npm install
npm run build
```

### Resetar pro Master
```bash
# Se vendor corrompido:
rm -rf src/vendor/master
cp -r ../../modulos/frontend/src src/vendor/master

# Se routes.json corrompido:
rm public/routes.json
cp src/routes.json public/routes.json
```

---

## ✅ Checklist Saudável

- [ ] `npm run build` executa sem erros
- [ ] `dist/` tem 8 arquivos
- [ ] `public/routes.json` existe
- [ ] `src/vendor/master/` existe com 11 arquivos
- [ ] DevTools console sem erros vermelhos
- [ ] Menu aparece com 5 itens
- [ ] Clicar em menu items navega
- [ ] CSS aplicado (cores, layout)
- [ ] Nenhum 404 no Network tab
- [ ] Sem warnings de missing dependencies

---

## 📞 Como Debugar

### 1. Console Logs
```tsx
// Em App.tsx, adicionar logs
useEffect(() => {
  loadProjectRoutes('/routes.json')
    .then((config) => {
      console.log('✅ Routes loaded:', config)  // ADD THIS
      setRoutes(config)
    })
    .catch((err) => {
      console.error('❌ Error:', err)  // ADD THIS
      setError(err.message)
    })
}, [])
```

### 2. DevTools
```javascript
// No console do navegador:
fetch('/routes.json').then(r => r.json()).then(console.log)

// Deve imprimir objeto com basePath e routes array
```

### 3. Network Tab
- Abrir DevTools
- Aba "Network"
- Refresh página (F5)
- Procurar por `routes.json`
- Clicar nela
- Ver Response (deve ser JSON válido)

### 4. Elements Tab
- Abrir DevTools
- Aba "Elements"
- Procurar por `<style>` tags
- CSS deve estar lá

---

## 🎓 Cheat Sheet

| Comando | O Que Faz |
|---------|-----------|
| `npm run dev` | Inicia servidor local em :3002 |
| `npm run build` | Compila para dist/ |
| `npm run preview` | Serve dist/ localmente |
| `npm run type-check` | Valida tipos TS |
| `npm run lint` | Roda eslint |

| Path | Significa |
|------|-----------|
| `/routes.json` | Arquivo em public/ (URL absoluta) |
| `../../types` | Sobe 2 pastas, entra em types/ |
| `../forms` | Sobe 1 pasta, entra em forms/ |
| `src/vendor/master` | Master copiado para build |

| Arquivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Componente raiz |
| `src/main.tsx` | Entry point React |
| `public/routes.json` | Configuração de rotas |
| `src/types/index.ts` | Types específicos do Férias |
| `vite.config.ts` | Build config |

---

## 🚨 Emergency Actions

### Tudo quebrado? Fazer isso na ordem:

1. **Kill servers**
   ```bash
   # Encontrar node processes
   ps aux | grep "node"
   # Matar todos
   pkill -f node
   ```

2. **Clean everything**
   ```bash
   rm -rf node_modules dist .vite
   rm package-lock.json
   ```

3. **Reinstall**
   ```bash
   npm install
   ```

4. **Copy files**
   ```bash
   rm -rf src/vendor/master
   cp -r ../../modulos/frontend/src src/vendor/master
   
   cp src/routes.json public/routes.json
   ```

5. **Rebuild**
   ```bash
   npm run build
   npm run dev
   ```

---

## 📚 Referências Rápidas

- **Build failing?** → Veja CORRECAO_ROUTES_ERROR.md
- **Como usar?** → Veja GUIA_DE_USO.md
- **Criar novo projeto?** → Veja TEMPLATE_NOVO_PROJETO.md
- **Arquitetura?** → Veja IMPLEMENTACAO_FINAL.md

---

*Guia de troubleshooting v1.0 - Updated 2024*
*Frontend Férias - BPMS*
