// ================================================================
// MODO OFFLINE — BLOCO 8: SERVICE WORKER
// Este arquivo roda "por trás" do navegador, separado da página.
// Função dele: guardar uma cópia de cada arquivo baixado (o próprio
// index.html, o Tailwind, a biblioteca do Supabase, as fontes) toda
// vez que o app é usado COM internet. Se depois o app for aberto SEM
// internet, essa cópia salva é usada no lugar — é isso que permite o
// app abrir mesmo sem conexão.
//
// Estratégia: "rede primeiro, cache como reserva". Ou seja, sempre que
// há internet, busca a versão mais nova de tudo (assim, atualizações
// feitas no GitHub aparecem normalmente); só usa a cópia salva quando
// a busca pela rede falha (sem conexão).
// ================================================================

const NOME_DO_CACHE = 'vidaseg-cache-v1';

// Ao instalar o Service Worker pela primeira vez, assume o controle
// imediatamente (sem isso, só valeria a partir da 2ª visita).
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Ao ativar, apaga versões antigas do cache (de uma instalação anterior
// deste mesmo Service Worker), pra não acumular lixo no navegador.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomesDeCacheExistentes) =>
      Promise.all(
        nomesDeCacheExistentes
          .filter((nome) => nome !== NOME_DO_CACHE)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

// Intercepta todo pedido de arquivo (GET) que a página fizer.
self.addEventListener('fetch', (evento) => {
  // Só cuidamos de pedidos GET (leitura de arquivos). Pedidos de
  // salvar dados no Supabase (POST) passam direto, sem passar por
  // aqui — quem cuida deles offline é o IndexedDB (Blocos 1 a 5).
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    fetch(evento.request)
      .then((respostaDaRede) => {
        // Deu certo buscar da internet: guarda uma cópia pra usar da
        // próxima vez que estiver offline, e devolve a resposta normal.
        const copiaParaGuardar = respostaDaRede.clone();
        caches.open(NOME_DO_CACHE).then((cache) => {
          cache.put(evento.request, copiaParaGuardar);
        });
        return respostaDaRede;
      })
      .catch(() => {
        // Sem internet: tenta devolver a cópia salva anteriormente.
        return caches.match(evento.request);
      })
  );
});
