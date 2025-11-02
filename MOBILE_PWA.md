# Otimizações Mobile e PWA

## Progressive Web App (PWA)

A aplicação agora suporta instalação como PWA, permitindo que usuários instalem o sistema em seus dispositivos móveis e usem offline.

### Recursos PWA Implementados

- ✅ **Service Worker**: Gerado automaticamente para cache de recursos
- ✅ **Manifest.json**: Configuração completa com ícones e metadados
- ✅ **Ícones**: 192x192, 512x512 e Apple Touch Icon (180x180)
- ✅ **Meta Tags**: Viewport, theme-color, apple-web-app configurados
- ✅ **Instalação**: Suporte para instalação em iOS, Android e Desktop

### Como Instalar o PWA

**Android (Chrome/Edge):**
1. Acesse a aplicação no navegador
2. Toque no menu (⋮) → "Adicionar à tela inicial"
3. Confirme a instalação

**iOS (Safari):**
1. Acesse a aplicação no Safari
2. Toque no botão de compartilhar (□↑)
3. Selecione "Adicionar à Tela de Início"

**Desktop (Chrome/Edge):**
1. Acesse a aplicação no navegador
2. Clique no ícone de instalação (+) na barra de endereço
3. Confirme a instalação

## Otimizações Mobile

### Layout Responsivo

**Sidebar Adaptativo:**
- **Desktop (>768px)**: Sidebar fixa visível
- **Mobile (<768px)**: Sidebar oculta, menu hambúrguer disponível
- Drawer deslizante para navegação em telas pequenas

**Header Otimizado:**
- Sticky header para acesso rápido ao menu
- Ícone hambúrguer visível apenas em mobile
- Nome do usuário oculto em telas pequenas para economizar espaço

### Tabelas Responsivas

- Scroll horizontal automático em telas pequenas
- Largura mínima mantida para preservar legibilidade
- Área de toque aumentada para facilitar interação

### Formulários e Modais

**Formulários:**
- Espaçamento aumentado entre campos (20px)
- Botões com altura mínima de 44px (área de toque recomendada)
- Labels e inputs maiores para melhor legibilidade

**Modais:**
- Tela cheia em dispositivos móveis (<768px)
- Border-radius removido para aproveitamento total da tela
- Altura mínima 100vh para conforto visual

### Cards e Estatísticas

- Cards mais compactos com padding reduzido
- Estatísticas com fonte ajustada para mobile
- Margens otimizadas para melhor aproveitamento do espaço

## Media Queries Implementadas

```css
/* Tablets e smartphones */
@media (max-width: 768px) {
  - Menu hambúrguer visível
  - Sidebar desktop oculta
  - Modais em tela cheia
  - Botões com min-height 44px
}

/* Smartphones pequenos */
@media (max-width: 480px) {
  - Layout ainda mais compacto
  - Fontes reduzidas
  - Padding mínimo
}

/* Dispositivos touch */
@media (hover: none) and (pointer: coarse) {
  - Área de toque aumentada
  - Hover effects removidos
  - Min-height 48px para itens clicáveis
}
```

## Teste de Responsividade

### Chrome DevTools
1. Abra DevTools (F12)
2. Clique no ícone de dispositivos móveis (Ctrl+Shift+M)
3. Teste diferentes resoluções:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - Samsung Galaxy S20 (360x800)
   - iPad (768x1024)

### Lighthouse PWA Audit
```bash
# Instalar Lighthouse
npm install -g lighthouse

# Executar audit
lighthouse http://localhost:3000 --view
```

**Checklist do Lighthouse:**
- ✅ Installable (PWA)
- ✅ Works offline
- ✅ Configured for custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Tap targets are appropriately sized

## Performance

### Build para Produção
```bash
npm run build
npm start
```

O PWA é **desabilitado em desenvolvimento** para facilitar debugging. Em produção:
- Service worker ativo
- Cache de recursos estáticos
- Instalação disponível
- Funcionamento offline básico

### Docker
O Dockerfile já está configurado para copiar os arquivos PWA gerados:
```bash
docker compose up -d --build
```

## Arquivos Criados/Modificados

### Novos Arquivos
- `public/manifest.json` - Configuração do PWA
- `public/icon.svg` - Ícone fonte (vetorial)
- `public/icon-192x192.png` - Ícone pequeno
- `public/icon-512x512.png` - Ícone grande
- `public/apple-touch-icon.png` - Ícone iOS
- `scripts/generate-icons.js` - Gerador de ícones

### Modificados
- `next.config.ts` - Configuração do next-pwa
- `app/layout.tsx` - Meta tags PWA
- `app/(dashboard)/layout.tsx` - Sidebar responsivo + Drawer
- `app/globals.css` - Media queries mobile
- `.gitignore` - Arquivos PWA gerados

## Próximos Passos (Opcional)

- [ ] Implementar modo offline completo com IndexedDB
- [ ] Adicionar notificações push
- [ ] Cache avançado de API responses
- [ ] Background sync para ações offline
- [ ] Atualização automática do service worker

## Recursos Adicionais

- [Next PWA Docs](https://github.com/DuCanhGH/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [Web.dev - Responsive Design](https://web.dev/responsive-web-design-basics/)
