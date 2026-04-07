// Redireciona / para o (shop) layout — Next.js App Router
// A home page fica em (shop)/page.tsx mas a rota raiz é /
// Esta re-exportação garante que / use o shop layout

export { default } from '@/app/(shop)/page';
