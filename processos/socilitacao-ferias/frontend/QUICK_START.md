# ⚡ QUICK START GUIDE

## 🎯 Em 5 Minutos

### 1. Iniciar Dev Server
```bash
cd C:\Projetos\Pessoal\bpms-quarkus\processos\socilitacao-ferias\frontend
npm run dev
```

### 2. Abrir no Navegador
```
http://localhost:3002
```

### 3. Que Você Verá
- Menu com 5 itens (Solicitar, Minhas, Tarefas, Processos, etc)
- Layout responsivo com Sidebar
- CSS styling completo
- Sem erros no console

**Pronto! 🎉**

---

## 📦 Build para Produção

```bash
npm run build
npm run preview  # Testar build localmente
```

Resultado em `dist/`:
- index.html
- assets/index-*.js (154 KB gzipped)
- assets/index-*.css (1.82 KB gzipped)

---

## 🐳 Docker

```bash
docker build -t bpms-ferias:1.0 .
docker run -d -p 80:80 bpms-ferias:1.0
```

Abrir: http://localhost

---

## 📂 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Componente raiz |
| `src/routes.json` | Configuração de rotas |
| `public/routes.json` | Routes para serve (CÓPIA) |
| `src/components/views/` | Páginas/Views |
| `src/components/forms/` | Formulários |
| `src/vendor/master/` | Master copiado |
| `vite.config.ts` | Build config |

---

## 🐛 Erros Comuns

| Erro | Solução |
|------|---------|
| Port 3002 already in use | `npm run dev -- --port 3003` |
| Cannot find module | `rm -rf node_modules && npm install` |
| CSS not loading | Verificar `src/App.css` |
| Routes not loading | Verificar `public/routes.json` |

**Mais erros?** → Ver `TROUBLESHOOTING.md`

---

## ✅ Checklist

- [ ] `npm run dev` roda sem erros
- [ ] Menu aparece com 5 itens
- [ ] Clicar em menu items navega
- [ ] CSS está colorido (não branco puro)
- [ ] Sem erros vermelhos no console
- [ ] DevTools → Network → sem 404s

---

## 🚀 Próximos Passos

1. **Testar formulários** - Preencher e submeter
2. **Conectar backend** - Configurar `VITE_API_URL`
3. **Deploy** - `docker build && docker push`
4. **Novo projeto** - Seguir `TEMPLATE_NOVO_PROJETO.md`

---

## 📚 Documentação

- **Como usar**: [GUIA_DE_USO.md](./GUIA_DE_USO.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Criar novo projeto**: [TEMPLATE_NOVO_PROJETO.md](../../TEMPLATE_NOVO_PROJETO.md)
- **Arquitetura completa**: [IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md)

---

## 💡 Tips

- Use DevTools do React: `npm install -g react-devtools`
- Habilitar Fast Refresh: Editar arquivo = reload automático
- Type-check: `npm run type-check` (sem compilar)
- Lint: `npm run lint` (oxlint)

---

*Quick Start v1.0 - BPMS Férias Frontend*
