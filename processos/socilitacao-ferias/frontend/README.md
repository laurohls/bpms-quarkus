# 🎉 BPMS Férias Frontend - v1.0.0

**Status:** ✅ Completo e Testado  
**Tech Stack:** React 19 + TypeScript + Vite + CSS Variables  
**Build Time:** 230ms | **Bundle Size:** 154.8 KB (gzipped)

---

## 📖 Começar Aqui

### ⚡ Quick Start (5 minutos)
```bash
npm run dev
# Abrir: http://localhost:3002
```

👉 **Ler:** [QUICK_START.md](./QUICK_START.md)

### 📚 Documentação Completa
- **Como usar localmente?** → [GUIA_DE_USO.md](./GUIA_DE_USO.md)
- **Algo está quebrado?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Arquitetura detalhada?** → [IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md)
- **Erro de routes?** → [CORRECAO_ROUTES_ERROR.md](./CORRECAO_ROUTES_ERROR.md)
- **Criar novo projeto?** → [TEMPLATE_NOVO_PROJETO.md](../../TEMPLATE_NOVO_PROJETO.md)

---

## 🎯 O Que É Este Projeto?

Frontend React para o processo de **Solicitação de Férias** do BPMS (Business Process Management System), construído com:

- ✅ **Master-Project Architecture** - Componentes reutilizáveis em master, lógica específica em project
- ✅ **5 Views** - Solicitação, Minhas Solicitações, Tarefas, Detalhe, BPMN
- ✅ **4 Formulários** - Solicitar, Analisar, Validar, Cancelar
- ✅ **6 Hooks Customizados** - useApi, useMutation, useCurrentUser, etc
- ✅ **Routes Dinâmicas** - Carregadas via JSON (routes.json)
- ✅ **Pronto para Produção** - Build otimizado, Docker ready, documentado

---

## 🚀 Scripts

```bash
npm run dev          # Dev server (localhost:3002)
npm run build        # Production build
npm run preview      # Preview build localmente
npm run type-check   # TypeScript validation
npm run lint         # Linting (oxlint)
```

---

## 🐳 Docker

```bash
docker build -t bpms-ferias:1.0 .
docker run -d -p 80:80 -e VITE_API_URL=http://api:8080 bpms-ferias:1.0
```

---

## 📊 Stats

- **Modules:** 189
- **Build Time:** 230ms
- **Bundle:** 154.8 KB (gzipped)
- **Views:** 5
- **Forms:** 4
- **Hooks:** 6
- **Build Errors:** 0 ✅

---

## 📚 Documentação

Tudo está documentado! Comece por:

1. **[QUICK_START.md](./QUICK_START.md)** - 5 minutos
2. **[GUIA_DE_USO.md](./GUIA_DE_USO.md)** - Uso completo
3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Resolver problemas
4. **[IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md)** - Arquitetura

---

**Desenvolvido com ❤️ • React • TypeScript • Vite**
