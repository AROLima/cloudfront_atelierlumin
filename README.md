# Atelier Lumin (Nome Fictício)

**Produção:** https://d2ashe5dcuj3hd.cloudfront.net

Landing page institucional minimalista e elegante para salão / espaço de beleza. Código pronto para abrir localmente em qualquer navegador (HTML, CSS e JS puros). Substitua facilmente marca, paleta e imagens.

## Visão Geral
- Foco em conversão (CTA hero, formulário e CTA final).
- Design pastel sofisticado com tipografia refinada (Playfair Display + Inter).
- Acessibilidade priorizada: HTML semântico, foco visível, labels, aria, navegação por teclado.
- Animações performáticas com GSAP (degradam bem sem JS ou se usuário prefere movimento reduzido).
- Estrutura modular de funções JS para cada grupo de animação/interação.

## Estrutura de Pastas
```
./
  index.html
  styles.css
  main.js
  assets/
    README.txt (guia rápido para imagens)
```

## Seções Principais
1. Header fixo com shrink on scroll.
2. Hero com headline, texto breve e CTAs.
3. Sobre / proposta de valor.
4. Serviços (cards animados on-scroll).
5. Galeria / portfolio com modal de visualização.
6. Depoimentos (slider automático + progress bar).
7. Contato (formulário validado + canais diretos).
8. CTA final reforçando agendamento.
9. Footer com navegação e créditos.

## Customização Rápida
| O que | Onde | Como |
|-------|------|------|
| Nome da marca | `index.html` / `[data-replace="logo-nome"]` | Substituir texto "Atelier Lumin" |
| Paleta de cores | `styles.css` (`:root`) | Alterar variáveis `--color-*` |
| Fontes | `<head>` (Google Fonts) | Trocar famílias mantendo fallback |
| Imagens hero/galeria | `index.html` | Substituir URLs por CDN própria / otimizada |
| Metadados SEO/OG | `<head>` | Atualizar `<title>`, `<meta description>` e og:tags |
| Links WhatsApp / Email | Seção Contato | Ajustar parâmetros e UTM |
| Desativar animações | `main.js` | `DISABLE_ANIMATIONS = true;` ou body class `no-motion` |

## Acessibilidade
- Navegação por teclado: elementos interativos recebem foco lógico.
- `skip-link` no topo facilita salto direto ao conteúdo.
- Modal da galeria fecha com ESC e inicia foco no botão fechar.
- Preferências de movimento reduzido respeitadas (prefers-reduced-motion: animações suprimidas).
- Contraste: combinações pastéis com texto escuro; ajuste se a identidade exigir contrastes ainda maiores.

## Animações (GSAP)
Funções no `main.js`:
- `initHeroAnimation()` – Fade + slide-up inicial (stagger).
- `initStickyHeader()` – Shrink e sombra ao rolar >120px.
- `initServiceScrollAnimations()` – Aparição progressive (ScrollTrigger) dos cards.
- `initGalleryInteractions()` – Hover micro + modal zoom.
- `initTestimonialsSlider()` – Slider automático (5s) com barra de progresso.
- `initFinalCtaPulse()` – Pulso sutil no botão final (pausa em hover/focus).
- `initFormValidation()` – Validação sem recarregar + feedback de campo.

### Preferências de Movimento
Se `prefers-reduced-motion: reduce` estiver ativo, a maioria das animações é reduzida/omitida para conforto visual.

## Formulário
Validação simples (required + email). Mensagens de feedback por campo e status final simulado. Integrar back-end: substituir handler do `submit` por `fetch()` ou serviço de forms (Formspree, Netlify Forms, etc.).

## Melhores Práticas de Imagens
- Produção: usar WebP/AVIF + fallback JPG.
- Larguras: gerar variantes (480, 768, 1080, 1440) e usar `<img srcset>`.
- SEO: revisar `alt` com contexto real (evitar termos genéricos).

## Deploy
### AWS S3 + CloudFront (Produção Atual)
Este projeto está publicado atualmente via bucket S3 (site estático) distribuído na CDN do CloudFront.

Fluxo utilizado:
1. Criado bucket S3 público apenas para conteúdo estático (ou com acesso restrito via OAC + CloudFront).
2. Upload dos arquivos `index.html`, `styles.css`, `main.js` e ativos (imagens, favicon, etc.).
3. Configurado CloudFront Distribution apontando para o bucket (Origin Access Control recomendado para evitar acesso público direto ao S3).
4. Definido `index.html` como Default Root Object.
5. Invalidações: ao atualizar assets críticos, executar invalidation de `/*` ou caminhos específicos (ex: `/styles.css`, `/main.js`).
6. (Opcional) Adicionar domínio custom (Route53) + certificado ACM (Region us-east-1) e configurar CNAME na distribuição.

Headers / boas práticas sugeridos no CloudFront:
- Cache HTML curto (ex: `Cache-Control: max-age=300, must-revalidate`).
- Cache agressivo para CSS/JS versão com hash (ex: `max-age=31536000, immutable`).
- Ativar GZIP + Brotli.
- Adicionar Security Headers via Function@Edge ou Lambda@Edge (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

URL atual em produção: `https://d2ashe5dcuj3hd.cloudfront.net`

### GitHub Pages
1. Criar repositório e fazer commit dos arquivos.
2. Settings → Pages → Fonte = branch `main` / root.
3. Aguardar build e atualizar metadados com URL final.

### Netlify
1. Arrastar pasta do projeto na interface ou conectar o repositório.
2. Build command: (vazio) / Publish dir: `.`
3. Ajustar domínio e redirecionamentos se necessário.

### Vercel
1. Importar repositório → nenhum build step necessário.
2. Projeto serve diretamente arquivos estáticos.

## Otimizações Futuras (Opcional)
- Adicionar `srcset` e lazy loading mais granular.
- Implementar foco cíclico completo na modal (trap robusto).
- Slider de depoimentos com controles acessíveis (pausar/avançar).
- Armazenar estado de tema (ex: dark pastel) e preferências de animação.
- Minificação automática com pipeline (ex: esbuild ou vite + plugin estático).

## Produção / Build Sugerido
### Minificação Rápida (exemplo usando npx esbuild)
```
npx esbuild index.html --bundle --minify --outfile=dist/index.html
```
Para este projeto estático simples, pode-se apenas minificar CSS/JS:
```
npx esbuild styles.css --minify --outfile=dist/styles.css
npx esbuild main.js --minify --outfile=dist/main.js
```
Copiar `index.html` ajustando paths para `dist/` se necessário.

### Imagens
- Gerar variantes (480, 720, 900, 1200) em WebP/AVIF.
- Usar `sharp` ou serviços externos (Cloudinary / Imgix) para transformação on-the-fly.

### Cache
- Definir headers de cache agressivos para assets (`styles.css`, `main.js`, imagens). 
- Manter HTML com cache curto (ex: 5m) para permitir updates de conteúdo.

### Segurança
- Content Security Policy (exemplo simplificado):
```
Content-Security-Policy: default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;
```
Ajustar conforme CDNs utilizadas.

### Pré-carregamento / Performance
- Já há `preconnect` + `preload` da folha de fontes.
- Hero image com `fetchpriority="high"` para melhorar LCP.

### Dark Mode
A alternância persiste via `localStorage` (`atelierTheme`). Garantir que cor de foco mantenha contraste AA.

### Teste de Acessibilidade
Executar ferramentas: Lighthouse, Axe, WAVE; validar contraste principalmente em botões outline no dark mode.

## Testes Manuais Recomendados
1. Carregar página em 320px, 768px, 1440px (layout fluido).
2. Tab navegação: verificar ordem e foco visível.
3. Desativar JS (usar devtools) → conteúdo continua acessível.
4. Ativar prefers-reduced-motion no sistema.
5. Enviar formulário vazio e depois válido.
6. Usar leitor de tela para percorrer landmarks (header, main, footer).

## Licenciamento / Uso
Conteúdo textual e estrutura podem ser reutilizados. Substitua todos os nomes, marcas e imagens antes de uso comercial. Verifique licenças das imagens se usar material além de placeholders.

## FAQ Rápido
- Onde desligo animações? `main.js` → `DISABLE_ANIMATIONS = true;`.
- Quebro algo removendo GSAP? O layout permanece; só remove efeitos.
- Como adicionar novo serviço? Duplicar `<article class="servico-card">` em `#servicos`.
- Posso usar outro slider? Sim, substitua logicamente a função `initTestimonialsSlider()`.

---
Dúvidas ou deseja extensão (ex: página de blog, agendamento online)? Adicione uma issue ou estenda o código conforme necessidade.
