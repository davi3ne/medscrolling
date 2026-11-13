# MedScrolling

Feed interativo estilo Instagram para substituir o *doomscrolling* por revisão rápida de conteúdo médico baseado em evidências.

## Desenvolvimento Local

```bash
npm install
npm run dev
```

## Build de Produção (Servidor Pessoal + Cloudflare)

```bash
npm install
npm run build
```

Os arquivos estáticos finais serão gerados na pasta `dist/`. Aponte seu servidor web (Nginx / Caddy) ou Cloudflare Tunnel para `dist/` com fallback de SPA para `index.html`.
