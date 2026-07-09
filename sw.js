<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VidaSeg | Usina Santa Adélia</title>

<!-- ================================================================
     TAILWIND VIA CDN
     Isso baixa o Tailwind pronto, sem precisar instalar nada no PC.
     Ideal pro piloto: zero configuração, funciona direto no GitHub Pages.
================================================================= -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Aqui a gente "ensina" o Tailwind a reconhecer as cores da marca
  // Usina Santa Adélia, pra usar em qualquer lugar como bg-marca-jb, text-marca-lima etc.
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'marca-jb': '#07583B',   // Verde escuro - Unidade JB
          'marca-pb': '#07583C',   // Verde (variação) - Unidade PB
          'marca-lima': '#B3DD64', // Verde lima - destaque/ação
        },
        fontFamily: {
          sans: ['"Open Sans"', 'sans-serif'],
        }
      }
    }
  }
</script>

<!-- ================================================================
     CONEXÃO COM O SUPABASE
     1) Carrega a "biblioteca" (SDK) que sabe conversar com o Supabase.
     2) Criamos um único "cliente" (supabaseClient) que o app inteiro
        vai usar pra buscar e salvar dados. Pense nele como o telefone
        que liga direto pro seu banco de dados.
================================================================= -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = 'https://qidgypibxllxepmhysvw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZGd5cGlieGxseGVwbWh5c3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzczODcsImV4cCI6MjA5ODUxMzM4N30.5o7pmDBRtPMEFXSBns52nc6K0vc5OWH3dc_t_3CGmfU';

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>

<!-- Fonte Open Sans, padrão em todos os seus sistemas -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<style>
  body { font-family: 'Open Sans', sans-serif; }

  /* Item de menu ativo (a tela que você está vendo agora) */
  .menu-item.ativo {
    background-color: rgba(179, 221, 100, 0.15);
    color: #B3DD64;
    border-left: 3px solid #B3DD64;
  }
</style>
</head>

<body class="bg-gray-100 text-gray-800">

<!-- ================================================================
     ESTRUTURA GERAL: SIDEBAR (fixa) + CONTEÚDO (dinâmico)
     A div id="app-shell" é o "corpo" do app. Ela é montada 1 única vez.
================================================================= -->
<div id="app-shell" class="flex h-screen overflow-hidden relative">

  <!-- ============================================================
       FUNDO ESCURECIDO — só aparece no celular quando a sidebar
       está aberta. Tocar nele fecha a sidebar (comportamento
       comum em apps: tocar "fora" de um menu, fecha o menu).
  ============================================================= -->
  <div id="overlay-sidebar" class="hidden fixed inset-0 bg-black/50 z-30 md:hidden"></div>

  <!-- ============================================================
       SIDEBAR — Menu lateral. NUNCA é apagado ou recriado.
       No celular: fica ESCONDIDA por padrão (-translate-x-full),
       "flutuando" por cima do conteúdo (position: fixed) quando aberta.
       No computador (a partir do breakpoint "md"): sempre visível
       e fixa no lugar, como já era antes (md:static md:translate-x-0).
  ============================================================= -->
  <aside id="sidebar" class="w-64 bg-marca-jb text-white flex flex-col shrink-0
    fixed md:static inset-y-0 left-0 z-40
    -translate-x-full md:translate-x-0
    transition-transform duration-200 ease-in-out">

    <!-- Cabeçalho / Logo -->
    <div class="p-5 border-b border-white/10">
      <h1 class="text-lg font-bold leading-tight">VidaSeg</h1>
      <p class="text-xs text-white/60 mt-1">Usina Santa Adélia</p>
    </div>

    <!-- MODO OFFLINE — BLOCO 6: só aparece quando há auditorias salvas
         neste aparelho aguardando envio pro Supabase. Fica escondido
         (classe "hidden") quando a fila está vazia. -->
    <div id="badge-fila-pendente" class="hidden mx-5 mt-3 px-3 py-2 bg-marca-lima/20 border border-marca-lima/40 text-marca-lima text-xs font-semibold rounded-lg text-center"></div>

    <!-- Links de navegação -->
    <nav class="flex-1 py-4 space-y-1">
      <button data-rota="dashboard" class="menu-item ativo w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition">
        <span>📊</span> Dashboard
      </button>
      <button data-rota="nova-auditoria" class="menu-item w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition">
        <span>📋</span> Nova Auditoria
      </button>
      <button data-rota="planos-acao" class="menu-item w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition">
        <span>✅</span> Planos de Ação
      </button>
      <button data-rota="areas" class="menu-item w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition">
        <span>🗺️</span> Áreas
      </button>
      <button data-rota="admin-checklists" class="menu-item w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition">
        <span>🛠️</span> Checklists
      </button>
    </nav>

    <!-- Rodapé da sidebar -->
    <div class="p-5 border-t border-white/10 text-xs text-white/50">
      Piloto — Agosto 2026
    </div>
  </aside>

  <!-- ============================================================
       COLUNA DA DIREITA: barra superior mobile + conteúdo.
       Agrupar os dois num "flex-col" permite empilhar a barra
       em cima do conteúdo, ambos ocupando a largura restante.
  ============================================================= -->
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- ==========================================================
         BARRA SUPERIOR — só aparece no celular ("md:hidden" a
         esconde a partir do breakpoint de tablet/desktop).
         O botão ☰ é o que abre a sidebar-gaveta.
    =========================================================== -->
    <header class="md:hidden flex items-center gap-3 bg-marca-jb text-white p-4 shrink-0">
      <button id="btn-abrir-menu-mobile" class="text-2xl leading-none" aria-label="Abrir menu">☰</button>
      <span class="font-bold">VidaSeg</span>
    </header>

    <!-- ==========================================================
         CONTEÚDO — Só esta caixa é trocada quando você navega.
    =========================================================== -->
    <main id="conteudo-app" class="flex-1 overflow-y-auto p-4 md:p-8">
      <!-- O JavaScript vai injetar o conteúdo de cada tela AQUI dentro -->
    </main>
  </div>

</div>

<!-- ================================================================
     MODO OFFLINE — BLOCO 1: CAMADA DE ACESSO AO INDEXEDDB
     Este bloco só CRIA as funções de acesso ao banco local do
     navegador (IndexedDB). Por enquanto, NENHUMA tela chama essas
     funções ainda — isso é de propósito, pra testarmos elas sozinhas
     primeiro, pelo Console do navegador, sem mexer no que já funciona.

     Duas "gavetas" (object stores) dentro do banco local:
       - rascunho_auditoria: a auditoria que está sendo preenchida
         agora (só existe UMA por vez, por isso usamos sempre o
         mesmo id fixo "atual").
       - fila_sincronizacao: auditorias completas que não conseguiram
         ser enviadas ao Supabase (por falta de internet ou erro),
         esperando serem reenviadas.
================================================================= -->
<script>
  const NOME_BANCO_LOCAL = 'vidaseg_offline';
  const VERSAO_BANCO_LOCAL = 1;

  // Abre o banco local (e cria as gavetas, se ainda não existirem).
  // Devolve uma Promise porque o IndexedDB é assíncrono por natureza.
  function abrirBancoLocal() {
    return new Promise((resolve, reject) => {
      const pedidoAbertura = indexedDB.open(NOME_BANCO_LOCAL, VERSAO_BANCO_LOCAL);

      // Só roda na 1ª vez que o banco é criado neste navegador, ou
      // quando no futuro aumentarmos o VERSAO_BANCO_LOCAL.
      pedidoAbertura.onupgradeneeded = (evento) => {
        const banco = evento.target.result;

        if (!banco.objectStoreNames.contains('rascunho_auditoria')) {
          banco.createObjectStore('rascunho_auditoria', { keyPath: 'id' });
        }

        if (!banco.objectStoreNames.contains('fila_sincronizacao')) {
          banco.createObjectStore('fila_sincronizacao', { keyPath: 'id', autoIncrement: true });
        }
      };

      pedidoAbertura.onsuccess = (evento) => resolve(evento.target.result);
      pedidoAbertura.onerror = (evento) => reject(evento.target.error);
    });
  }

  // ------------------------------------------------------------
  // RASCUNHO: a auditoria em andamento. Sempre sobrescreve o mesmo
  // registro (id fixo "atual"), pois só existe um rascunho por vez.
  // ------------------------------------------------------------
  async function salvarRascunho(dadosRascunho) {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('rascunho_auditoria', 'readwrite');
      transacao.objectStore('rascunho_auditoria').put({ id: 'atual', ...dadosRascunho });
      transacao.oncomplete = () => resolve();
      transacao.onerror = (evento) => reject(evento.target.error);
    });
  }

  async function lerRascunho() {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('rascunho_auditoria', 'readonly');
      const pedido = transacao.objectStore('rascunho_auditoria').get('atual');
      pedido.onsuccess = () => resolve(pedido.result || null);
      pedido.onerror = (evento) => reject(evento.target.error);
    });
  }

  async function apagarRascunho() {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('rascunho_auditoria', 'readwrite');
      transacao.objectStore('rascunho_auditoria').delete('atual');
      transacao.oncomplete = () => resolve();
      transacao.onerror = (evento) => reject(evento.target.error);
    });
  }

  // ------------------------------------------------------------
  // FILA DE SINCRONIZAÇÃO: auditorias completas aguardando reenvio.
  // Usa autoIncrement (cada item recebe um id novo), pois pode haver
  // várias auditorias pendentes ao mesmo tempo.
  // ------------------------------------------------------------
  async function adicionarNaFila(auditoriaCompleta) {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('fila_sincronizacao', 'readwrite');
      transacao.objectStore('fila_sincronizacao').add({
        ...auditoriaCompleta,
        status: 'pendente_sincronizacao',
        criado_em: new Date().toISOString()
      });
      transacao.oncomplete = () => resolve();
      transacao.onerror = (evento) => reject(evento.target.error);
    });
  }

  async function listarFila() {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('fila_sincronizacao', 'readonly');
      const pedido = transacao.objectStore('fila_sincronizacao').getAll();
      pedido.onsuccess = () => resolve(pedido.result);
      pedido.onerror = (evento) => reject(evento.target.error);
    });
  }

  async function removerDaFila(idNaFila) {
    const banco = await abrirBancoLocal();
    return new Promise((resolve, reject) => {
      const transacao = banco.transaction('fila_sincronizacao', 'readwrite');
      transacao.objectStore('fila_sincronizacao').delete(idNaFila);
      transacao.oncomplete = () => resolve();
      transacao.onerror = (evento) => reject(evento.target.error);
    });
  }
</script>

<!-- ================================================================
     JAVASCRIPT — O "cérebro" que troca de tela sem recarregar a página
================================================================= -->
<script>
  // Pega a referência da caixa de conteúdo (vamos mexer só nela)
  const conteudoApp = document.getElementById('conteudo-app');

  // ------------------------------------------------------------
  // "RASCUNHO EM MEMÓRIA": guarda as respostas do checklist que
  // está sendo preenchido AGORA, enquanto o auditor não termina.
  // Ainda não vai pro banco de dados — isso vem na próxima etapa.
  // Formato: { "id-da-pergunta-1": "Conforme", "id-da-pergunta-2": "Nao_Conforme" }
  // ------------------------------------------------------------
  let respostasEmAndamento = {};

  // Guarda a URL de cada foto já enviada ao Supabase Storage.
  // Formato: { "id-da-pergunta-1": "https://.../fotos-inspecoes/arquivo.jpg" }
  let fotosEmAndamento = {};

  // Guarda a assinatura do auditor como texto base64 (uma "foto" do
  // desenho feito no Canvas, convertida em texto pra poder salvar no banco).
  let assinaturaAuditorBase64 = null;

  // ------------------------------------------------------------
  // MODO OFFLINE — BLOCO 2: guarda qual checklist/área/pessoas estão
  // envolvidas na auditoria em andamento. Preenchido assim que a
  // Identificação é concluída (esses dados hoje só passam de função
  // em função como parâmetro — precisamos deles à parte pra montar
  // o rascunho completo a qualquer momento).
  // ------------------------------------------------------------
  let rascunhoContexto = null;

  // ------------------------------------------------------------
  // Junta tudo que descreve a auditoria em andamento (contexto +
  // respostas + fotos + assinatura) e grava no IndexedDB (Bloco 1).
  // Chamamos essa função toda vez que algo muda, pra nunca perder o
  // progresso. Ela roda "no fundo" — por isso quem chama não precisa
  // esperar (não usa "await"), exceto no momento da assinatura.
  // ------------------------------------------------------------
  async function salvarProgressoRascunho() {
    if (!rascunhoContexto) return;

    try {
      await salvarRascunho({
        contexto: rascunhoContexto,
        respostas: respostasEmAndamento,
        fotos: fotosEmAndamento,
        assinatura: assinaturaAuditorBase64,
        atualizado_em: new Date().toISOString()
      });
    } catch (erro) {
      console.error('Não foi possível salvar o rascunho local:', erro);
    }
  }

  // ------------------------------------------------------------
  // MODO OFFLINE — BLOCO 4: quando não há internet (ou a conexão cai
  // no meio do envio), a auditoria completa vai pra fila de
  // sincronização em vez de ser perdida. O rascunho "em andamento" é
  // removido, porque a partir de agora ela vive na fila, com status
  // pendente_sincronizacao, até ser enviada de verdade (Bloco 5).
  // ------------------------------------------------------------
  async function moverAuditoriaAtualParaFilaEAvisar(tituloChecklist) {
    await adicionarNaFila({
      contexto: rascunhoContexto,
      respostas: respostasEmAndamento,
      fotos: fotosEmAndamento,
      assinatura: assinaturaAuditorBase64
    });
    await apagarRascunho();
    await atualizarBadgeFila();

    respostasEmAndamento = {};
    fotosEmAndamento = {};
    assinaturaAuditorBase64 = null;
    rascunhoContexto = null;

    conteudoApp.innerHTML = `
      <div class="text-center py-16">
        <div class="text-5xl mb-4">📴</div>
        <h2 class="text-2xl font-bold text-marca-jb mb-2">Salvo neste aparelho</h2>
        <p class="text-gray-500 mb-6">
          Sem conexão no momento. Sua auditoria "${tituloChecklist}" foi salva neste aparelho
          e será enviada automaticamente assim que a internet voltar. Não é preciso refazer nada.
        </p>
        <button id="btn-nova-auditoria-offline" class="bg-marca-jb text-white font-semibold px-6 py-3 rounded-lg hover:bg-marca-jb/90">
          Iniciar Nova Auditoria
        </button>
      </div>
    `;

    document.getElementById('btn-nova-auditoria-offline').addEventListener('click', () => {
      navegarPara('nova-auditoria');
    });
  }

  // ------------------------------------------------------------
  // MODO OFFLINE — BLOCO 5: envia UMA auditoria da fila pro Supabase.
  // É o mesmo processo (foto → inspeção → respostas) que a tela de
  // assinatura já faz — repetido aqui de propósito, em vez de
  // reaproveitado, pra não mexer naquele fluxo já testado.
  // Lança um erro (throw) se algo falhar, pra quem chamou saber que
  // esse item ainda não pode sair da fila.
  // ------------------------------------------------------------
  async function enviarAuditoriaParaSupabase(dadosAuditoria) {
    const { contexto, respostas, fotos, assinatura } = dadosAuditoria;

    for (const perguntaId of Object.keys(fotos)) {
      const arquivo = fotos[perguntaId];
      if (!(arquivo instanceof Blob)) continue; // já é uma URL enviada antes

      const nomeArquivo = `${perguntaId}/${Date.now()}-${arquivo.name || 'foto.jpg'}`;
      const { error: erroUpload } = await supabaseClient
        .storage
        .from('fotos-inspecoes')
        .upload(nomeArquivo, arquivo);

      if (erroUpload) throw new Error(`Erro ao enviar foto: ${erroUpload.message}`);

      const { data: urlPublica } = supabaseClient
        .storage
        .from('fotos-inspecoes')
        .getPublicUrl(nomeArquivo);

      fotos[perguntaId] = urlPublica.publicUrl;
    }

    const { data: inspecaoCriada, error: erroInspecao } = await supabaseClient
      .from('inspecoes_executadas')
      .insert({
        template_id: contexto.templateId,
        area_id: contexto.areaId,
        nome_auditor: contexto.auditores.join(', '),
        nomes_auditores: contexto.auditores,
        nomes_auditados: contexto.auditados,
        assinatura_auditor_base64: assinatura,
        status: 'finalizada',
        data_hora_fim: new Date().toISOString()
      })
      .select()
      .single();

    if (erroInspecao) throw new Error(`Erro ao salvar a inspeção: ${erroInspecao.message}`);

    const linhasDeResposta = Object.keys(respostas).map(perguntaId => ({
      inspecao_id: inspecaoCriada.id,
      pergunta_id: perguntaId,
      resposta: respostas[perguntaId],
      foto_url: fotos[perguntaId] || null
    }));

    const { error: erroRespostas } = await supabaseClient
      .from('respostas_itens')
      .insert(linhasDeResposta);

    if (erroRespostas) throw new Error(`Inspeção criada, mas houve erro ao salvar as respostas: ${erroRespostas.message}`);
  }

  // ------------------------------------------------------------
  // MODO OFFLINE — BLOCO 5: percorre a fila e tenta enviar cada item
  // pendente. Só remove da fila o que realmente foi confirmado. Se um
  // item falhar (conexão caiu de novo), para por ali — os que sobraram
  // tentam de novo na próxima chamada (evento online ou intervalo).
  // "sincronizandoFila" evita que duas chamadas rodem ao mesmo tempo.
  // ------------------------------------------------------------
  let sincronizandoFila = false;

  async function processarFilaDeSincronizacao() {
    if (sincronizandoFila || !navigator.onLine) return;
    sincronizandoFila = true;

    try {
      const itensPendentes = await listarFila();

      for (const item of itensPendentes) {
        try {
          await enviarAuditoriaParaSupabase(item);
          await removerDaFila(item.id);
          console.log(`Auditoria da fila (id ${item.id}) sincronizada com sucesso.`);
        } catch (erro) {
          console.error(`Falha ao sincronizar auditoria da fila (id ${item.id}):`, erro);
          break;
        }
      }
    } finally {
      sincronizandoFila = false;
      await atualizarBadgeFila();
    }
  }

  // ------------------------------------------------------------
  // MODO OFFLINE — BLOCO 6: mostra/esconde o aviso na sidebar com a
  // quantidade de auditorias aguardando envio. Chamado sempre que a
  // fila pode ter mudado (entrou item novo, ou terminou uma tentativa
  // de sincronização) e uma vez ao abrir o app.
  // ------------------------------------------------------------
  async function atualizarBadgeFila() {
    const badge = document.getElementById('badge-fila-pendente');
    if (!badge) return;

    const itensPendentes = await listarFila();

    if (itensPendentes.length === 0) {
      badge.classList.add('hidden');
      return;
    }

    const texto = itensPendentes.length === 1
      ? '1 auditoria aguardando envio'
      : `${itensPendentes.length} auditorias aguardando envio`;

    badge.textContent = `📤 ${texto}`;
    badge.classList.remove('hidden');
  }

  // ------------------------------------------------------------
  // Monta a árvore de áreas como uma lista de itens CLICÁVEIS,
  // usada dentro do painel de seleção de "Local da Inspeção".
  // Cada nível tem mais recuo (padding), deixando a hierarquia clara.
  // ------------------------------------------------------------
  function desenharArvoreSelecionavel(nos, profundidade = 0) {
    return nos.map(no => `
      <div class="item-area-selecionavel px-3 py-3 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 active:bg-marca-lima/20"
           style="margin-left: ${profundidade * 18}px"
           data-id="${no.id}" data-nome="${no.nome}">
        <span class="text-gray-800 ${no.filhos.length === 0 ? 'font-semibold' : ''}">${no.nome}</span>
        <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">${no.tipo}</span>
        ${no.unidade_sigla ? `<span class="text-xs bg-marca-lima/30 text-marca-jb px-2 py-0.5 rounded">${no.unidade_sigla}</span>` : ''}
      </div>
      ${no.filhos.length > 0 ? desenharArvoreSelecionavel(no.filhos, profundidade + 1) : ''}
    `).join('');
  }

  // ------------------------------------------------------------
  // Busca as perguntas de UM checklist específico e monta o formulário.
  // Essa função não faz parte do "mapa de rotas" porque ela precisa
  // de um parâmetro (qual checklist foi clicado) — por isso é chamada
  // diretamente pelo clique no cartão, e não pelo menu lateral.
  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // TELA DE IDENTIFICAÇÃO — primeira etapa ao abrir um checklist.
  // Coleta: Unidade, Local (Área), Auditores e Auditados, antes
  // de mostrar qualquer pergunta. Isso evita que o auditor esqueça
  // de preencher algo importante no meio do processo.
  // ------------------------------------------------------------
  async function abrirTelaIdentificacao(templateId, tituloChecklist) {
    conteudoApp.innerHTML = `<p class="text-gray-400">Carregando...</p>`;

    const { data: areasDisponiveis } = await supabaseClient
      .from('unidades_areas')
      .select('id, nome, tipo, unidade_sigla, area_pai_id')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    conteudoApp.innerHTML = `
      <button id="btn-voltar-lista-ident" class="text-sm text-marca-jb mb-4 hover:underline">&larr; Voltar para lista</button>
      <h2 class="text-2xl font-bold text-marca-jb mb-1">Identificação da Auditoria</h2>
      <p class="text-gray-500 text-sm mb-4">${tituloChecklist}</p>

      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Unidade</label>
        <select id="select-unidade-ident" class="w-full border border-gray-300 rounded-lg p-2.5 mb-4">
          <option value="">— Selecione a unidade —</option>
          <option value="JB">JB (Jaboticabal)</option>
          <option value="PB">PB (Pereira Barreto)</option>
        </select>

        <label class="block text-sm font-semibold text-gray-700 mb-1">Área</label>
        <select id="select-area-ident" class="w-full border border-gray-300 rounded-lg p-2.5 mb-4" disabled>
          <option value="">— Selecione a unidade primeiro —</option>
        </select>

        <label class="block text-sm font-semibold text-gray-700 mb-1">Subárea <span class="font-normal text-gray-400">(se houver)</span></label>
        <select id="select-subarea-ident" class="w-full border border-gray-300 rounded-lg p-2.5" disabled>
          <option value="">— Selecione a área primeiro —</option>
        </select>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Auditor(es)</label>
        <div id="lista-campos-auditores"></div>
        <button id="btn-add-auditor" type="button" class="text-marca-jb text-sm font-semibold hover:underline mt-1">+ Adicionar auditor</button>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Auditado(s)</label>
        <div id="lista-campos-auditados"></div>
        <button id="btn-add-auditado" type="button" class="text-marca-jb text-sm font-semibold hover:underline mt-1">+ Adicionar auditado</button>
      </div>

      <div id="aviso-identificacao" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-4"></div>

      <button id="btn-avancar-identificacao"
        class="w-full bg-marca-jb text-white font-semibold py-3 rounded-lg hover:bg-marca-jb/90 transition">
        Avançar &rarr;
      </button>
    `;

    document.getElementById('btn-voltar-lista-ident').addEventListener('click', () => {
      navegarPara('nova-auditoria');
    });

    // Adiciona o 1º campo de auditor e de auditado, já abertos por padrão
    adicionarCampoPessoa('lista-campos-auditores', 'auditor');
    adicionarCampoPessoa('lista-campos-auditados', 'auditado');

    document.getElementById('btn-add-auditor').addEventListener('click', () => {
      adicionarCampoPessoa('lista-campos-auditores', 'auditor');
    });
    document.getElementById('btn-add-auditado').addEventListener('click', () => {
      adicionarCampoPessoa('lista-campos-auditados', 'auditado');
    });

    const selectArea = document.getElementById('select-area-ident');
    const selectSubarea = document.getElementById('select-subarea-ident');

    // ------------------------------------------------------------
    // 1º nível: escolher a UNIDADE filtra quais ÁREAS aparecem
    // (só as que são tipo "Area" E pertencem a essa unidade).
    // ------------------------------------------------------------
    document.getElementById('select-unidade-ident').addEventListener('change', (evento) => {
      const unidadeEscolhida = evento.target.value;

      // Reseta os dois selects seguintes, pois mudou a unidade
      selectSubarea.innerHTML = `<option value="">— Selecione a área primeiro —</option>`;
      selectSubarea.disabled = true;

      if (!unidadeEscolhida) {
        selectArea.innerHTML = `<option value="">— Selecione a unidade primeiro —</option>`;
        selectArea.disabled = true;
        return;
      }

      const areasFiltradas = areasDisponiveis.filter(a => a.tipo === 'Area' && a.unidade_sigla === unidadeEscolhida);
      selectArea.innerHTML = `<option value="">— Selecione a área —</option>` +
        areasFiltradas.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
      selectArea.disabled = false;
    });

    // ------------------------------------------------------------
    // 2º nível: escolher a ÁREA filtra quais SUBÁREAS aparecem
    // (só as que apontam pra essa área como pai). Se não houver
    // nenhuma subárea cadastrada, o campo continua desabilitado
    // e simplesmente não é obrigatório escolher nada nele.
    // ------------------------------------------------------------
    selectArea.addEventListener('change', (evento) => {
      const areaEscolhidaId = evento.target.value;

      if (!areaEscolhidaId) {
        selectSubarea.innerHTML = `<option value="">— Selecione a área primeiro —</option>`;
        selectSubarea.disabled = true;
        return;
      }

      const subareasFiltradas = areasDisponiveis.filter(a => a.tipo === 'Subarea' && a.area_pai_id === areaEscolhidaId);

      if (subareasFiltradas.length === 0) {
        selectSubarea.innerHTML = `<option value="">— Esta área não tem subáreas —</option>`;
        selectSubarea.disabled = true;
        return;
      }

      selectSubarea.innerHTML = `<option value="">— Nenhuma (usar só a área) —</option>` +
        subareasFiltradas.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
      selectSubarea.disabled = false;
    });

    // Botão "Avançar": valida o essencial e segue pro formulário de perguntas
    document.getElementById('btn-avancar-identificacao').addEventListener('click', () => {
      const avisoEl = document.getElementById('aviso-identificacao');

      // O local final é a Subárea, se escolhida; senão, a Área escolhida.
      // Assim o auditor não é obrigado a ter subárea cadastrada pra avançar.
      const areaId = selectSubarea.value || selectArea.value;

      const auditores = coletarValoresPessoa('lista-campos-auditores');
      const auditados = coletarValoresPessoa('lista-campos-auditados');
      const pendencias = [];

      if (!areaId) pendencias.push('Selecione a unidade e a área da inspeção.');
      if (auditores.length === 0) pendencias.push('Informe ao menos um auditor.');

      if (pendencias.length > 0) {
        avisoEl.innerHTML = `<strong>Antes de continuar, resolva:</strong><br>${pendencias.join('<br>')}`;
        avisoEl.classList.remove('hidden');
        avisoEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      avisoEl.classList.add('hidden');
      abrirFormularioChecklist(templateId, tituloChecklist, areaId, auditores, auditados);
    });
  }

  // ------------------------------------------------------------
  // Adiciona uma linha de "campo de matrícula + nome encontrado +
  // botão remover (×)" dentro do container indicado (lista de
  // auditores ou auditados). Ao digitar a matrícula e sair do campo
  // (evento "blur"), busca o nome correspondente na tabela colaboradores.
  // ------------------------------------------------------------
  function adicionarCampoPessoa(idContainer, tipoRotulo) {
    const container = document.getElementById(idContainer);
    const linha = document.createElement('div');
    linha.className = 'mb-2 campo-pessoa';
    linha.innerHTML = `
      <div class="flex gap-2">
        <input type="text" inputmode="numeric" placeholder="Matrícula do ${tipoRotulo}"
          class="input-matricula w-32 border border-gray-300 rounded-lg p-2.5">
        <div class="flex-1 border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-sm text-gray-400 texto-nome-encontrado">
          Digite a matrícula para buscar o nome
        </div>
        <button type="button" class="btn-remover-pessoa text-gray-400 hover:text-red-600 px-2" title="Remover">&times;</button>
      </div>
    `;
    container.appendChild(linha);

    const inputMatricula = linha.querySelector('.input-matricula');
    const textoNome = linha.querySelector('.texto-nome-encontrado');

    // Guarda o nome confirmado direto no próprio elemento da linha,
    // pra coletarValoresPessoa() conseguir ler depois sem buscar de novo.
    linha.dataset.nomeConfirmado = '';

    inputMatricula.addEventListener('blur', async () => {
      const matricula = inputMatricula.value.trim();
      linha.dataset.nomeConfirmado = '';

      if (!matricula) {
        textoNome.textContent = 'Digite a matrícula para buscar o nome';
        textoNome.className = 'flex-1 border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-sm text-gray-400 texto-nome-encontrado';
        return;
      }

      textoNome.textContent = 'Buscando...';

      const { data: colaborador, error } = await supabaseClient
        .from('colaboradores')
        .select('nome')
        .eq('matricula', matricula)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !colaborador) {
        textoNome.textContent = 'Matrícula não encontrada';
        textoNome.className = 'flex-1 border border-red-300 rounded-lg p-2.5 bg-red-50 text-sm text-red-600 texto-nome-encontrado';
        return;
      }

      // Encontrou! Guarda o nome confirmado e mostra pro auditor conferir.
      linha.dataset.nomeConfirmado = colaborador.nome;
      textoNome.textContent = `✓ ${colaborador.nome}`;
      textoNome.className = 'flex-1 border border-green-300 rounded-lg p-2.5 bg-green-50 text-sm text-green-700 font-semibold texto-nome-encontrado';
    });

    linha.querySelector('.btn-remover-pessoa').addEventListener('click', () => {
      // Nunca deixa remover a última linha — sempre sobra pelo menos 1 campo
      if (container.querySelectorAll('.campo-pessoa').length > 1) {
        linha.remove();
      } else {
        inputMatricula.value = '';
        linha.dataset.nomeConfirmado = '';
        textoNome.textContent = 'Digite a matrícula para buscar o nome';
        textoNome.className = 'flex-1 border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-sm text-gray-400 texto-nome-encontrado';
      }
    });
  }

  // ------------------------------------------------------------
  // Lê todos os nomes CONFIRMADOS (matrícula encontrada com sucesso)
  // dentro de um container, ignorando linhas sem matrícula válida.
  // ------------------------------------------------------------
  function coletarValoresPessoa(idContainer) {
    return Array.from(document.getElementById(idContainer).querySelectorAll('.campo-pessoa'))
      .map(linha => linha.dataset.nomeConfirmado)
      .filter(nome => nome && nome.length > 0);
  }

  // ------------------------------------------------------------
  // Decide QUAL widget de resposta desenhar, olhando o tipo_resposta
  // configurado no cadastro da pergunta. Cada botão carrega um
  // data-cor genérico (verde/vermelho/cinza) — assim o clique sabe
  // qual cor de destaque aplicar, sem precisar saber o texto exato
  // do botão. Isso permite adicionar novos tipos no futuro sem
  // reescrever a lógica de clique.
  // ------------------------------------------------------------
  function montarWidgetResposta(p) {
    if (p.tipo_resposta === 'sim_nao') {
      return `
        <div class="flex gap-2 mt-3" data-grupo-resposta="${p.id}">
          <button data-pergunta-id="${p.id}" data-valor="Sim" data-cor="verde"
            class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-green-600 text-green-700 hover:bg-green-50">
            Sim
          </button>
          <button data-pergunta-id="${p.id}" data-valor="Nao" data-cor="vermelho"
            class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-red-600 text-red-700 hover:bg-red-50">
            Não
          </button>
          <button data-pergunta-id="${p.id}" data-valor="Nao_Aplicavel" data-cor="cinza"
            class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-gray-400 text-gray-600 hover:bg-gray-50">
            N/A
          </button>
        </div>
      `;
    }

    if (p.tipo_resposta === 'nota') {
      // Gera as opções de 0 a 10 dinamicamente, em vez de escrever as 11 na mão
      const opcoesNota = Array.from({ length: 11 }, (_, n) => `<option value="${n}">${n}</option>`).join('');
      return `
        <select data-select-nota="${p.id}" class="mt-3 w-full border border-gray-300 rounded-lg p-2.5">
          <option value="">— Selecione uma nota de 0 a 10 —</option>
          ${opcoesNota}
        </select>
      `;
    }

    // Padrão: 'conforme_nao_conforme' (e qualquer valor não reconhecido cai aqui também)
    return `
      <div class="flex gap-2 mt-3" data-grupo-resposta="${p.id}">
        <button data-pergunta-id="${p.id}" data-valor="Conforme" data-cor="verde"
          class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-green-600 text-green-700 hover:bg-green-50">
          Conforme
        </button>
        <button data-pergunta-id="${p.id}" data-valor="Nao_Conforme" data-cor="vermelho"
          class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-red-600 text-red-700 hover:bg-red-50">
          Não Conforme
        </button>
        <button data-pergunta-id="${p.id}" data-valor="Nao_Aplicavel" data-cor="cinza"
          class="botao-resposta px-4 py-2 rounded border text-sm font-semibold border-gray-400 text-gray-600 hover:bg-gray-50">
          N/A
        </button>
      </div>
    `;
  }

  async function abrirFormularioChecklist(templateId, tituloChecklist, areaId, auditores, auditados) {
    // Zera o rascunho, pois é um checklist novo sendo aberto
    respostasEmAndamento = {};
    fotosEmAndamento = {};

    // MODO OFFLINE — Bloco 2: registra o contexto desta auditoria e já
    // grava um primeiro rascunho local, mesmo antes de responder qualquer
    // pergunta (assim, mesmo se cair a conexão/fechar a aba logo em
    // seguida, já existe algo salvo pra retomar).
    rascunhoContexto = { templateId, tituloChecklist, areaId, auditores, auditados };
    salvarProgressoRascunho();

    conteudoApp.innerHTML = `
      <p class="text-gray-400">Carregando perguntas de "${tituloChecklist}"...</p>
    `;

    // Busca só as perguntas do checklist clicado, na ordem certa
    const { data: perguntas, error } = await supabaseClient
      .from('perguntas_template')
      .select('id, ordem, texto_pergunta, norma_regulamentadora_especifica, exige_foto, tipo_resposta')
      .eq('template_id', templateId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      conteudoApp.innerHTML = `<p class="text-red-600">Erro ao carregar perguntas: ${error.message}</p>`;
      return;
    }

    if (!perguntas || perguntas.length === 0) {
      conteudoApp.innerHTML = `
        <p class="text-gray-500">Este checklist ainda não tem perguntas cadastradas na tabela
        <code class="bg-gray-200 px-1 rounded">perguntas_template</code>.</p>
      `;
      return;
    }

    // Monta o HTML de cada pergunta, com o widget de resposta certo
    // (botões Conforme/Não, botões Sim/Não, ou seletor de Nota)
    // dependendo do tipo_resposta configurado no cadastro.
    const perguntasHtml = perguntas.map((p, index) => `
      <div class="bg-white border border-gray-200 rounded-lg p-5 mb-3">
        <p class="font-semibold text-gray-800">${index + 1}. ${p.texto_pergunta}</p>
        <p class="text-xs text-gray-400 mt-1">${p.norma_regulamentadora_especifica || ''}</p>

        ${montarWidgetResposta(p)}

        ${p.exige_foto ? `
          <div class="mt-3 pt-3 border-t border-gray-100">
            <label class="inline-flex items-center gap-2 text-sm font-semibold text-marca-jb cursor-pointer">
              📷 Anexar foto (opcional)
              <input type="file" accept="image/*" capture="environment"
                data-input-foto="${p.id}" class="hidden">
            </label>
            <div data-status-foto="${p.id}" class="text-xs text-gray-400 mt-1">Nenhuma foto enviada ainda.</div>
            <img data-preview-foto="${p.id}" class="hidden mt-2 rounded border border-gray-200 max-h-40">
          </div>
        ` : ''}
      </div>
    `).join('');

    conteudoApp.innerHTML = `
      <button id="btn-voltar-lista" class="text-sm text-marca-jb mb-4 hover:underline">&larr; Voltar para lista</button>
      <h2 class="text-2xl font-bold text-marca-jb mb-4">${tituloChecklist}</h2>

      <div id="lista-perguntas">${perguntasHtml}</div>

      <div id="aviso-validacao" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mt-4"></div>

      <button id="btn-finalizar-auditoria"
        class="mt-4 w-full bg-marca-jb text-white font-semibold py-3 rounded-lg hover:bg-marca-jb/90 transition">
        Finalizar Auditoria &rarr;
      </button>
    `;

    // Botão "Voltar": volta para a Tela de Identificação (não a lista
    // inteira), já que templateId e tituloChecklist a gente já tem em mãos.
    document.getElementById('btn-voltar-lista').addEventListener('click', () => {
      abrirTelaIdentificacao(templateId, tituloChecklist);
    });

    // Botão "Finalizar Auditoria": confere se está tudo respondido
    // antes de deixar o auditor avançar para a tela de assinatura.
    document.getElementById('btn-finalizar-auditoria').addEventListener('click', () => {
      const avisoEl = document.getElementById('aviso-validacao');
      const pendencias = [];

      perguntas.forEach((p, index) => {
        // Falta responder essa pergunta?
        if (!respostasEmAndamento[p.id]) {
          pendencias.push(`Pergunta ${index + 1}: falta responder.`);
        }
        // A foto agora é opcional — não bloqueia mais o Finalizar,
        // mesmo em perguntas com exige_foto = true.
      });

      if (pendencias.length > 0) {
        avisoEl.innerHTML = `<strong>Antes de continuar, resolva:</strong><br>${pendencias.join('<br>')}`;
        avisoEl.classList.remove('hidden');
        avisoEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      avisoEl.classList.add('hidden');
      abrirTelaAssinatura(templateId, tituloChecklist, perguntas, areaId, auditores, auditados);
    });

    // Liga um "escutador" em cada campo de foto.
    // Quando o auditor escolhe/tira uma foto, isso dispara automaticamente.
    document.querySelectorAll('[data-input-foto]').forEach(input => {
      input.addEventListener('change', async (evento) => {
        const perguntaId = input.dataset.inputFoto;
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        const statusEl = document.querySelector(`[data-status-foto="${perguntaId}"]`);
        const previewEl = document.querySelector(`[data-preview-foto="${perguntaId}"]`);

        // 1. Feedback visual imediato: mostra a foto escolhida na hora
        //    (isso usa a própria memória do navegador, ainda não subiu nada)
        previewEl.src = URL.createObjectURL(arquivo);
        previewEl.classList.remove('hidden');

        // MODO OFFLINE — Bloco 3: em vez de subir a foto pro Supabase Storage
        // agora, guardamos o próprio arquivo (Blob) no rascunho local. O
        // envio de verdade só acontece no momento de "Confirmar Assinatura
        // e Salvar" (função abrirTelaAssinatura) — assim, tirar foto
        // funciona mesmo sem internet.
        fotosEmAndamento[perguntaId] = arquivo;
        await salvarProgressoRascunho();

        statusEl.textContent = '📷 Foto salva neste aparelho — será enviada ao concluir a auditoria';
        statusEl.classList.add('text-marca-jb');
      });
    });

    // Liga um clique em CADA botão de resposta (Conforme/Não, Sim/Não, etc)
    document.querySelectorAll('.botao-resposta').forEach(botao => {
      botao.addEventListener('click', () => {
        const perguntaId = botao.dataset.perguntaId;
        const valor = botao.dataset.valor;

        // 1. Salva a resposta no rascunho em memória
        respostasEmAndamento[perguntaId] = valor;

        // 2. Efeito visual: dentro do grupo dessa pergunta, remove o destaque
        //    de todos os botões e aplica só no que foi clicado agora.
        const grupo = document.querySelector(`[data-grupo-resposta="${perguntaId}"]`);
        grupo.querySelectorAll('.botao-resposta').forEach(b => {
          b.classList.remove('bg-green-600', 'bg-red-600', 'bg-gray-500', 'text-white');
        });

        // A cor de destaque vem do data-cor do próprio botão clicado
        // (não mais de uma lista fixa de valores) — assim qualquer
        // tipo de resposta futuro funciona sem precisar mexer aqui.
        const coresPorNome = { verde: 'bg-green-600', vermelho: 'bg-red-600', cinza: 'bg-gray-500' };
        botao.classList.add(coresPorNome[botao.dataset.cor], 'text-white');

        // MODO OFFLINE — Bloco 2: grava o progresso local a cada resposta
        salvarProgressoRascunho();
      });
    });

    // Liga a mudança de valor em CADA seletor de Nota (tipo_resposta = 'nota')
    document.querySelectorAll('[data-select-nota]').forEach(select => {
      select.addEventListener('change', () => {
        const perguntaId = select.dataset.selectNota;
        respostasEmAndamento[perguntaId] = select.value;

        // MODO OFFLINE — Bloco 2: grava o progresso local a cada resposta
        salvarProgressoRascunho();
      });
    });
  }

  // ------------------------------------------------------------
  // Monta a tela de assinatura digital do auditor, usando um
  // <canvas> HTML5 como "quadro de desenho".
  // ------------------------------------------------------------
  function abrirTelaAssinatura(templateId, tituloChecklist, perguntas, areaId, auditores, auditados) {
    assinaturaAuditorBase64 = null; // zera assinatura anterior, se houver

    conteudoApp.innerHTML = `
      <button id="btn-voltar-formulario" class="text-sm text-marca-jb mb-4 hover:underline">&larr; Voltar para as perguntas</button>
      <h2 class="text-2xl font-bold text-marca-jb mb-1">Assinatura</h2>
      <p class="text-gray-500 text-sm mb-4">Assine no quadro abaixo com o dedo ou o mouse para concluir "${tituloChecklist}".</p>

      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 text-sm">
        <p><span class="font-semibold text-gray-700">Auditor(es):</span> ${auditores.join(', ')}</p>
        ${auditados.length > 0 ? `<p class="mt-1"><span class="font-semibold text-gray-700">Auditado(s):</span> ${auditados.join(', ')}</p>` : ''}
      </div>

      <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <canvas id="canvas-assinatura" class="w-full touch-none" height="220"></canvas>
      </div>

      <div class="flex gap-3 mt-3">
        <button id="btn-limpar-assinatura" class="px-4 py-2 rounded border border-gray-400 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          Limpar
        </button>
      </div>

      <div id="aviso-assinatura" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mt-4"></div>

      <button id="btn-confirmar-assinatura"
        class="mt-4 w-full bg-marca-lima text-marca-jb font-bold py-3 rounded-lg hover:opacity-90 transition">
        Confirmar Assinatura e Salvar &rarr;
      </button>
    `;

    document.getElementById('btn-voltar-formulario').addEventListener('click', () => {
      abrirFormularioChecklist(templateId, tituloChecklist, areaId, auditores, auditados);
    });

    // --- Configuração do Canvas ---
    const canvas = document.getElementById('canvas-assinatura');
    const contexto = canvas.getContext('2d');

    // O canvas precisa ter a MESMA largura em pixels reais que sua largura
    // exibida na tela, senão o desenho fica desalinhado do dedo/mouse.
    canvas.width = canvas.clientWidth;

    contexto.strokeStyle = '#07583B'; // verde da marca
    contexto.lineWidth = 2.5;
    contexto.lineCap = 'round';

    let desenhando = false;

    function pegarPosicao(evento) {
      const retangulo = canvas.getBoundingClientRect();
      return {
        x: evento.clientX - retangulo.left,
        y: evento.clientY - retangulo.top
      };
    }

    canvas.addEventListener('pointerdown', (evento) => {
      desenhando = true;
      const pos = pegarPosicao(evento);
      contexto.beginPath();
      contexto.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('pointermove', (evento) => {
      if (!desenhando) return;
      const pos = pegarPosicao(evento);
      contexto.lineTo(pos.x, pos.y);
      contexto.stroke();
    });

    canvas.addEventListener('pointerup', () => { desenhando = false; });
    canvas.addEventListener('pointerleave', () => { desenhando = false; });

    // Botão "Limpar": apaga tudo e deixa o quadro em branco de novo
    document.getElementById('btn-limpar-assinatura').addEventListener('click', () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Botão "Confirmar": converte o desenho em texto base64 e salva tudo
    document.getElementById('btn-confirmar-assinatura').addEventListener('click', async () => {
      const avisoEl = document.getElementById('aviso-assinatura');

      // Validação: verifica se o canvas está realmente em branco
      const canvasVazio = document.createElement('canvas');
      canvasVazio.width = canvas.width;
      canvasVazio.height = canvas.height;
      if (canvas.toDataURL() === canvasVazio.toDataURL()) {
        avisoEl.textContent = 'Por favor, assine no quadro antes de continuar.';
        avisoEl.classList.remove('hidden');
        return;
      }

      avisoEl.classList.add('hidden');
      assinaturaAuditorBase64 = canvas.toDataURL('image/png');

      // MODO OFFLINE — Bloco 2: garante que a assinatura já fica salva
      // localmente antes de tentar enviar ao Supabase.
      await salvarProgressoRascunho();

      // Trava o botão e avisa que está salvando, pra evitar duplo-clique
      const botaoConfirmar = document.getElementById('btn-confirmar-assinatura');
      botaoConfirmar.disabled = true;
      botaoConfirmar.textContent = 'Salvando...';

      // MODO OFFLINE — Bloco 4: se já sabemos que não há internet, nem
      // tentamos falar com o Supabase — vai direto pra fila local.
      if (!navigator.onLine) {
        await moverAuditoriaAtualParaFilaEAvisar(tituloChecklist);
        return;
      }

      // A partir daqui, qualquer erro inesperado (não só os que o Supabase
      // avisa educadamente) vai cair no "catch" lá embaixo e aparecer na tela,
      // em vez de travar o botão sem explicação.
      try {
        // ------------------------------------------------------------
        // MODO OFFLINE — Bloco 3: até agora, cada foto só existia como
        // arquivo (Blob) guardado no rascunho local. Só AQUI, no momento
        // de salvar de verdade, é que enviamos cada uma pro Supabase
        // Storage e trocamos pela URL pública — feito antes do Passo 1
        // pra não criar uma inspeção "pela metade" se uma foto falhar.
        // ------------------------------------------------------------
        for (const perguntaId of Object.keys(fotosEmAndamento)) {
          const arquivo = fotosEmAndamento[perguntaId];
          if (!(arquivo instanceof Blob)) continue; // já é uma URL enviada antes; não reenvia

          const nomeArquivo = `${perguntaId}/${Date.now()}-${arquivo.name || 'foto.jpg'}`;
          const { error: erroUpload } = await supabaseClient
            .storage
            .from('fotos-inspecoes')
            .upload(nomeArquivo, arquivo);

          if (erroUpload) {
            avisoEl.textContent = `Erro ao enviar foto: ${erroUpload.message}`;
            avisoEl.classList.remove('hidden');
            botaoConfirmar.disabled = false;
            botaoConfirmar.textContent = 'Confirmar Assinatura e Salvar →';
            return;
          }

          const { data: urlPublica } = supabaseClient
            .storage
            .from('fotos-inspecoes')
            .getPublicUrl(nomeArquivo);

          fotosEmAndamento[perguntaId] = urlPublica.publicUrl;
        }
        await salvarProgressoRascunho();

        // ------------------------------------------------------------
        // PASSO 1: cria o "cabeçalho" da auditoria em inspecoes_executadas.
        // O .select() no final pede pro Supabase devolver a linha criada,
        // pra gente pegar o "id" dela e usar no Passo 2.
        // nome_auditor (texto único) guarda os nomes juntos, por
        // compatibilidade; nomes_auditores/nomes_auditados guardam a
        // lista de verdade, cada nome separado.
        // ------------------------------------------------------------
        const { data: inspecaoCriada, error: erroInspecao } = await supabaseClient
          .from('inspecoes_executadas')
          .insert({
            template_id: templateId,
            area_id: areaId,
            nome_auditor: auditores.join(', '),
            nomes_auditores: auditores,
            nomes_auditados: auditados,
            assinatura_auditor_base64: assinaturaAuditorBase64,
            status: 'finalizada',
            data_hora_fim: new Date().toISOString()
          })
          .select()
          .single();

        if (erroInspecao) {
          avisoEl.textContent = `Erro ao salvar a inspeção: ${erroInspecao.message}`;
          avisoEl.classList.remove('hidden');
          botaoConfirmar.disabled = false;
          botaoConfirmar.textContent = 'Confirmar Assinatura e Salvar →';
          return;
        }

        // ------------------------------------------------------------
        // PASSO 2: monta UMA linha de resposta pra cada pergunta,
        // todas já apontando pro id da inspeção criada acima.
        // ------------------------------------------------------------
        const linhasDeResposta = perguntas.map(p => ({
          inspecao_id: inspecaoCriada.id,
          pergunta_id: p.id,
          resposta: respostasEmAndamento[p.id],
          foto_url: fotosEmAndamento[p.id] || null
        }));

        const { error: erroRespostas } = await supabaseClient
          .from('respostas_itens')
          .insert(linhasDeResposta);

        if (erroRespostas) {
          avisoEl.textContent = `Inspeção criada, mas houve erro ao salvar as respostas: ${erroRespostas.message}`;
          avisoEl.classList.remove('hidden');
          botaoConfirmar.disabled = false;
          botaoConfirmar.textContent = 'Confirmar Assinatura e Salvar →';
          return;
        }

        // ------------------------------------------------------------
        // PASSO 3: tudo salvo com sucesso — limpa o rascunho da memória
        // e mostra a tela de confirmação final.
        // ------------------------------------------------------------
        respostasEmAndamento = {};
        fotosEmAndamento = {};
        assinaturaAuditorBase64 = null;
        rascunhoContexto = null;

        // MODO OFFLINE — Bloco 2: já que salvou de verdade no Supabase,
        // apaga o rascunho local — ele não serve mais pra nada.
        await apagarRascunho();

        conteudoApp.innerHTML = `
          <div class="text-center py-16">
            <div class="text-5xl mb-4">✅</div>
            <h2 class="text-2xl font-bold text-marca-jb mb-2">Auditoria salva com sucesso!</h2>
            <p class="text-gray-500 mb-6">"${tituloChecklist}" foi registrada por ${auditores.join(', ')}.</p>
            <button id="btn-nova-auditoria-final" class="bg-marca-jb text-white font-semibold px-6 py-3 rounded-lg hover:bg-marca-jb/90">
              Iniciar Nova Auditoria
            </button>
          </div>
        `;

        document.getElementById('btn-nova-auditoria-final').addEventListener('click', () => {
          navegarPara('nova-auditoria');
        });

      } catch (erroInesperado) {
        // Captura QUALQUER outro tipo de erro (ex: falha de rede,
        // erro de programação) que não veio educadamente do Supabase.
        console.error('Erro inesperado ao salvar auditoria (tratado como queda de conexão):', erroInesperado);

        // MODO OFFLINE — Bloco 4: um erro que cai aqui, no meio do envio,
        // é quase sempre a conexão caindo (o navegador não conseguiu nem
        // completar a chamada de rede). Em vez de só mostrar o erro e
        // arriscar perder os dados, guardamos a auditoria inteira na
        // fila local pra tentar de novo mais tarde.
        await moverAuditoriaAtualParaFilaEAvisar(tituloChecklist);
      }
    });
  }

  // ------------------------------------------------------------
  // Recebe a lista "plana" de áreas (do jeito que vem do banco) e
  // reorganiza em uma árvore: cada área ganha uma lista "filhos"
  // com as áreas que apontam pra ela através de area_pai_id.
  // ------------------------------------------------------------
  function construirArvoreAreas(listaPlana) {
    const mapaPorId = {};
    listaPlana.forEach(area => {
      mapaPorId[area.id] = { ...area, filhos: [] };
    });

    const raizes = []; // áreas sem pai (ex: as Unidades JB e PB)

    listaPlana.forEach(area => {
      if (area.area_pai_id && mapaPorId[area.area_pai_id]) {
        // Essa área tem pai: encaixa ela na lista "filhos" do pai
        mapaPorId[area.area_pai_id].filhos.push(mapaPorId[area.id]);
      } else {
        // Sem pai: é uma área de topo (raiz da árvore)
        raizes.push(mapaPorId[area.id]);
      }
    });

    return raizes;
  }

  // ------------------------------------------------------------
  // Desenha a árvore em HTML, chamando a si mesma para cada nível
  // de "filhos" (isso se chama recursão: a função se usa de novo
  // pra resolver o mesmo problema em uma escala menor).
  // ------------------------------------------------------------
  function desenharArvoreHtml(nos, profundidade = 0) {
    return nos.map(no => `
      <div style="margin-left: ${profundidade * 24}px" class="py-2 border-b border-gray-100 flex justify-between items-center">
        <div>
          <span class="font-semibold text-gray-800">${no.nome}</span>
          <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">${no.tipo}</span>
          ${no.unidade_sigla ? `<span class="text-xs bg-marca-lima/30 text-marca-jb px-2 py-0.5 rounded ml-1">${no.unidade_sigla}</span>` : ''}
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button class="btn-editar-area text-gray-400 hover:text-marca-jb text-base"
            data-id="${no.id}" data-nome="${no.nome}" data-tipo="${no.tipo}"
            data-unidade="${no.unidade_sigla || ''}" data-pai="${no.area_pai_id || ''}"
            title="Editar">✏️</button>
          <button class="btn-excluir-area text-gray-400 hover:text-red-600 text-base"
            data-id="${no.id}" data-nome="${no.nome}"
            title="Excluir">🗑️</button>
        </div>
      </div>
      ${no.filhos.length > 0 ? desenharArvoreHtml(no.filhos, profundidade + 1) : ''}
    `).join('');
  }

  // ------------------------------------------------------------
  // Monta as <option> do campo "Área Pai" do formulário, reaproveitando
  // a mesma árvore da visualização — assim as opções também aparecem
  // com recuo, ficando fácil ver em qual nível cada área está.
  // ------------------------------------------------------------
  function montarOpcoesSelectPai(nos, profundidade = 0) {
    return nos.map(no => `
      <option value="${no.id}">${'—'.repeat(profundidade)} ${no.nome}</option>
      ${no.filhos.length > 0 ? montarOpcoesSelectPai(no.filhos, profundidade + 1) : ''}
    `).join('');
  }

  // ------------------------------------------------------------
  // Liga todos os cliques da tela de Áreas: abrir/cancelar o formulário
  // e salvar uma área nova no banco.
  // ------------------------------------------------------------
  function ligarEventosTelaAreas() {
    const painel = document.getElementById('painel-form-area');

    // Botão "+ Nova Área": sempre abre o formulário em BRANCO
    document.getElementById('btn-abrir-form-area').addEventListener('click', () => {
      document.getElementById('titulo-form-area').textContent = 'Cadastrar nova área';
      document.getElementById('input-area-id-edicao').value = '';
      document.getElementById('input-area-nome').value = '';
      document.getElementById('select-area-tipo').value = 'Area';
      document.getElementById('select-area-unidade').value = '';
      document.getElementById('select-area-pai').value = '';
      document.getElementById('btn-salvar-area').textContent = 'Salvar Área';
      painel.classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-area').addEventListener('click', () => {
      painel.classList.add('hidden');
    });

    // Botão "✏️ Editar" de cada linha: preenche o formulário com os
    // dados daquela área específica.
    document.querySelectorAll('.btn-editar-area').forEach(botao => {
      botao.addEventListener('click', () => {
        document.getElementById('titulo-form-area').textContent = 'Editar área';
        document.getElementById('input-area-id-edicao').value = botao.dataset.id;
        document.getElementById('input-area-nome').value = botao.dataset.nome;
        document.getElementById('select-area-tipo').value = botao.dataset.tipo;
        document.getElementById('select-area-unidade').value = botao.dataset.unidade;
        document.getElementById('select-area-pai').value = botao.dataset.pai;
        document.getElementById('btn-salvar-area').textContent = 'Salvar Alterações';
        painel.classList.remove('hidden');
        painel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Botão "🗑️ Excluir": exclusão lógica (ativo = false), preservando
    // o histórico de auditorias que já usaram essa área.
    document.querySelectorAll('.btn-excluir-area').forEach(botao => {
      botao.addEventListener('click', async () => {
        const confirmar = confirm(`Excluir a área "${botao.dataset.nome}"? Se ela tiver sub-áreas cadastradas dentro dela, elas ficarão sem vínculo de local pai.`);
        if (!confirmar) return;

        const { error } = await supabaseClient
          .from('unidades_areas')
          .update({ ativo: false })
          .eq('id', botao.dataset.id);

        if (error) {
          alert(`Erro ao excluir: ${error.message}`);
          return;
        }

        renderizarTelaAreas();
      });
    });

    // Botão "Salvar": decide sozinho entre CRIAR ou ATUALIZAR,
    // olhando se o campo escondido tem um id de edição preenchido.
    document.getElementById('btn-salvar-area').addEventListener('click', async () => {
      const idEmEdicao = document.getElementById('input-area-id-edicao').value;
      const nome = document.getElementById('input-area-nome').value.trim();
      const tipo = document.getElementById('select-area-tipo').value;
      const unidadeSigla = document.getElementById('select-area-unidade').value || null;
      const areaPaiId = document.getElementById('select-area-pai').value || null;
      const avisoEl = document.getElementById('aviso-form-area');

      if (!nome) {
        avisoEl.textContent = 'Por favor, preencha o nome da área.';
        avisoEl.classList.remove('hidden');
        return;
      }

      // Trava simples de segurança: uma área não pode ser "pai de si mesma"
      if (idEmEdicao && areaPaiId === idEmEdicao) {
        avisoEl.textContent = 'Uma área não pode ser sua própria área pai.';
        avisoEl.classList.remove('hidden');
        return;
      }

      const dadosArea = { nome, tipo, unidade_sigla: unidadeSigla, area_pai_id: areaPaiId };

      const operacao = idEmEdicao
        ? supabaseClient.from('unidades_areas').update(dadosArea).eq('id', idEmEdicao)
        : supabaseClient.from('unidades_areas').insert(dadosArea);

      const { error } = await operacao;

      if (error) {
        avisoEl.textContent = `Erro ao salvar: ${error.message}`;
        avisoEl.classList.remove('hidden');
        return;
      }

      // Sucesso: recarrega a tela inteira de Áreas, já mostrando
      // a área nova/editada na árvore e o formulário limpo de novo.
      renderizarTelaAreas();
    });
  }

  // ------------------------------------------------------------
  // "MAPA DE ROTAS": cada tela é uma função que devolve um pedaço de HTML.
  // Por enquanto são só telas de exemplo (placeholders).
  // Nos próximos passos, vamos preencher cada uma de verdade.
  // ------------------------------------------------------------
  const rotas = {
    dashboard: () => `
      <h2 class="text-2xl font-bold text-marca-jb mb-2">Dashboard</h2>
      <p class="text-gray-500">Aqui vão entrar os indicadores gerais de SSMA.</p>
    `,
    'nova-auditoria': async () => {
      // 1. Mostra uma mensagem de carregamento IMEDIATAMENTE,
      //    porque buscar dados no Supabase leva um tempinho.
      conteudoApp.innerHTML = `
        <h2 class="text-2xl font-bold text-marca-jb mb-2">Nova Auditoria</h2>
        <p class="text-gray-400">Carregando checklists disponíveis...</p>
      `;

      // 2. Pede pro Supabase: "me dá todas as linhas da tabela
      //    checklists_templates que estiverem com ativo = true"
      const { data: checklists, error } = await supabaseClient
        .from('checklists_templates')
        .select('id, titulo, setor, norma_procedimento_base')
        .eq('ativo', true);

      // 3. Se algo deu errado na conexão, avisa em vez de travar
      if (error) {
        conteudoApp.innerHTML = `
          <h2 class="text-2xl font-bold text-marca-jb mb-2">Nova Auditoria</h2>
          <p class="text-red-600">Erro ao carregar checklists: ${error.message}</p>
        `;
        return;
      }

      // 4. Se não tem nenhum checklist cadastrado ainda no banco
      if (!checklists || checklists.length === 0) {
        conteudoApp.innerHTML = `
          <h2 class="text-2xl font-bold text-marca-jb mb-2">Nova Auditoria</h2>
          <p class="text-gray-500">Nenhum checklist cadastrado ainda na tabela
          <code class="bg-gray-200 px-1 rounded">checklists_templates</code>.</p>
        `;
        return;
      }

      // 5. Transforma cada checklist encontrado num "cartão" clicável.
      //    O atributo data-id guarda o UUID do checklist escondido no HTML,
      //    pra sabermos qual foi clicado depois.
      const cardsHtml = checklists.map(c => `
        <div class="card-checklist bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-marca-lima transition cursor-pointer"
             data-id="${c.id}" data-titulo="${c.titulo}">
          <h3 class="font-bold text-marca-jb">${c.titulo}</h3>
          <p class="text-sm text-gray-500 mt-1">Setor: ${c.setor || '—'}</p>
          <p class="text-xs text-gray-400 mt-1">${c.norma_procedimento_base || ''}</p>
        </div>
      `).join('');

      // 6. Só agora substitui o "Carregando..." pelo resultado final
      conteudoApp.innerHTML = `
        <h2 class="text-2xl font-bold text-marca-jb mb-2">Nova Auditoria</h2>
        <p class="text-gray-500 mb-6">Escolha um checklist para iniciar:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${cardsHtml}
        </div>
      `;

      // 7. Liga um clique em CADA cartão desenhado.
      //    Ao clicar, chama abrirFormularioChecklist() passando
      //    o id e o título guardados no data-id / data-titulo.
      document.querySelectorAll('.card-checklist').forEach(cartao => {
        cartao.addEventListener('click', () => {
          abrirTelaIdentificacao(cartao.dataset.id, cartao.dataset.titulo);
        });
      });
    },
    'planos-acao': () => `
      <h2 class="text-2xl font-bold text-marca-jb mb-2">Planos de Ação</h2>
      <p class="text-gray-500">Aqui vão entrar os planos 5W2H.</p>
    `,
    areas: () => renderizarTelaAreas(),
    'admin-checklists': () => renderizarTelaAdminChecklists(),
  };

  // ------------------------------------------------------------
  // Busca as áreas no banco, desenha a árvore e o botão "+ Nova Área".
  // Vira uma função própria (e não mais presa dentro do mapa de rotas)
  // porque também vamos chamá-la de novo depois de cadastrar uma área,
  // pra atualizar a tela sem precisar o usuário clicar no menu de novo.
  // ------------------------------------------------------------
  async function renderizarTelaAreas() {
    conteudoApp.innerHTML = `
      <h2 class="text-2xl font-bold text-marca-jb mb-2">Áreas</h2>
      <p class="text-gray-400">Carregando estrutura de áreas...</p>
    `;

    const { data: areas, error } = await supabaseClient
      .from('unidades_areas')
      .select('id, nome, tipo, unidade_sigla, area_pai_id')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      conteudoApp.innerHTML = `<p class="text-red-600">Erro ao carregar áreas: ${error.message}</p>`;
      return;
    }

    const arvore = construirArvoreAreas(areas || []);
    const arvoreHtml = areas && areas.length > 0
      ? desenharArvoreHtml(arvore)
      : `<p class="text-gray-500">Nenhuma área cadastrada ainda.</p>`;

    // Monta as opções do "Área Pai" do formulário, reaproveitando a árvore
    // pra mostrar cada opção já com recuo (indentação) igual à visualização.
    const opcoesAreaPai = montarOpcoesSelectPai(arvore);

    conteudoApp.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-2xl font-bold text-marca-jb">Áreas</h2>
        <button id="btn-abrir-form-area" class="bg-marca-jb text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-marca-jb/90">
          + Nova Área
        </button>
      </div>
      <p class="text-gray-500 mb-4">Estrutura hierárquica de locais da usina.</p>

      <div id="painel-form-area" class="hidden bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h3 id="titulo-form-area" class="font-bold text-marca-jb mb-3">Cadastrar nova área</h3>

        <input type="hidden" id="input-area-id-edicao" value="">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
        <input id="input-area-nome" type="text" placeholder="Ex: Moenda, Esteira 2, Pátio de Cana"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
        <select id="select-area-tipo" class="w-full border border-gray-300 rounded-lg p-2.5 mb-3">
          <option value="Unidade">Unidade</option>
          <option value="Area" selected>Área</option>
          <option value="Subarea">Subárea</option>
        </select>

        <label class="block text-sm font-semibold text-gray-700 mb-1">Unidade</label>
        <select id="select-area-unidade" class="w-full border border-gray-300 rounded-lg p-2.5 mb-3">
          <option value="">— Não se aplica —</option>
          <option value="JB">JB (Jaboticabal)</option>
          <option value="PB">PB (Pereira Barreto)</option>
        </select>

        <label class="block text-sm font-semibold text-gray-700 mb-1">Área Pai (onde essa área se encaixa)</label>
        <select id="select-area-pai" class="w-full border border-gray-300 rounded-lg p-2.5 mb-3">
          <option value="">— Nenhuma (esta é uma área de topo) —</option>
          ${opcoesAreaPai}
        </select>

        <div id="aviso-form-area" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-3"></div>

        <div class="flex gap-2">
          <button id="btn-salvar-area" class="bg-marca-lima text-marca-jb font-bold px-4 py-2 rounded-lg hover:opacity-90">
            Salvar Área
          </button>
          <button id="btn-cancelar-area" class="text-gray-500 text-sm px-4 py-2 hover:underline">
            Cancelar
          </button>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-5">
        ${arvoreHtml}
      </div>
    `;

    ligarEventosTelaAreas();
  }

  // ------------------------------------------------------------
  // Busca os checklists cadastrados, desenha a lista e o formulário
  // de "+ Novo Checklist". Mesmo padrão usado em renderizarTelaAreas().
  // ------------------------------------------------------------
  async function renderizarTelaAdminChecklists() {
    conteudoApp.innerHTML = `
      <h2 class="text-2xl font-bold text-marca-jb mb-2">Checklists</h2>
      <p class="text-gray-400">Carregando checklists cadastrados...</p>
    `;

    const { data: checklists, error } = await supabaseClient
      .from('checklists_templates')
      .select('id, titulo, setor, norma_procedimento_base')
      .eq('ativo', true)
      .order('titulo', { ascending: true });

    if (error) {
      conteudoApp.innerHTML = `<p class="text-red-600">Erro ao carregar checklists: ${error.message}</p>`;
      return;
    }

    const listaHtml = (checklists && checklists.length > 0)
      ? checklists.map(c => `
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex justify-between items-center hover:border-marca-lima transition">
            <div class="flex-1 cursor-pointer card-admin-checklist" data-id="${c.id}" data-titulo="${c.titulo}">
              <h3 class="font-bold text-marca-jb">${c.titulo}</h3>
              <p class="text-sm text-gray-500">Setor: ${c.setor || '—'} · ${c.norma_procedimento_base || 'sem norma vinculada'}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0 ml-3">
              <span class="text-marca-jb text-sm font-semibold hidden md:inline">Gerenciar perguntas &rarr;</span>
              <button class="btn-editar-checklist text-gray-400 hover:text-marca-jb text-lg"
                data-id="${c.id}" data-titulo="${c.titulo}" data-setor="${c.setor || ''}" data-norma="${c.norma_procedimento_base || ''}"
                title="Editar">✏️</button>
              <button class="btn-excluir-checklist text-gray-400 hover:text-red-600 text-lg"
                data-id="${c.id}" data-titulo="${c.titulo}"
                title="Excluir">🗑️</button>
            </div>
          </div>
        `).join('')
      : `<p class="text-gray-500">Nenhum checklist cadastrado ainda.</p>`;

    conteudoApp.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-2xl font-bold text-marca-jb">Checklists</h2>
        <button id="btn-abrir-form-checklist" class="bg-marca-jb text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-marca-jb/90">
          + Novo Checklist
        </button>
      </div>
      <p class="text-gray-500 mb-4">Clique em um checklist para gerenciar suas perguntas.</p>

      <div id="painel-form-checklist" class="hidden bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h3 id="titulo-form-checklist" class="font-bold text-marca-jb mb-3">Cadastrar novo checklist</h3>

        <!-- Campo escondido: guarda o id do checklist quando estamos EDITANDO.
             Fica vazio quando é um cadastro novo. -->
        <input type="hidden" id="input-checklist-id-edicao" value="">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Título</label>
        <input id="input-checklist-titulo" type="text" placeholder="Ex: Inspeção de Máquinas e Equipamentos"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Setor</label>
        <input id="input-checklist-setor" type="text" placeholder="Ex: Mecânica, Agrícola, Frota (deixe em branco se for para toda a usina)"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Norma / Procedimento base</label>
        <input id="input-checklist-norma" type="text" placeholder="Ex: NR-12 ou Procedimento Interno PRC-045"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima">

        <div id="aviso-form-checklist" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-3"></div>

        <div class="flex gap-2">
          <button id="btn-salvar-checklist" class="bg-marca-lima text-marca-jb font-bold px-4 py-2 rounded-lg hover:opacity-90">
            Salvar Checklist
          </button>
          <button id="btn-cancelar-checklist" class="text-gray-500 text-sm px-4 py-2 hover:underline">
            Cancelar
          </button>
        </div>
      </div>

      <div>${listaHtml}</div>
    `;

    ligarEventosTelaAdminChecklists();
  }

  // ------------------------------------------------------------
  // Liga os cliques da tela de administração de Checklists:
  // abrir/cancelar o formulário, salvar um checklist novo, e
  // (no próximo bloco) clicar num cartão pra gerenciar as perguntas.
  // ------------------------------------------------------------
  function ligarEventosTelaAdminChecklists() {
    const painel = document.getElementById('painel-form-checklist');

    // Botão "+ Novo Checklist": abre o formulário sempre em BRANCO,
    // limpando qualquer edição anterior que possa ter ficado no campo escondido.
    document.getElementById('btn-abrir-form-checklist').addEventListener('click', () => {
      document.getElementById('titulo-form-checklist').textContent = 'Cadastrar novo checklist';
      document.getElementById('input-checklist-id-edicao').value = '';
      document.getElementById('input-checklist-titulo').value = '';
      document.getElementById('input-checklist-setor').value = '';
      document.getElementById('input-checklist-norma').value = '';
      document.getElementById('btn-salvar-checklist').textContent = 'Salvar Checklist';
      painel.classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-checklist').addEventListener('click', () => {
      painel.classList.add('hidden');
    });

    // Botão "✏️ Editar" de cada cartão: abre o MESMO formulário,
    // mas já preenchido com os dados daquele checklist específico.
    document.querySelectorAll('.btn-editar-checklist').forEach(botao => {
      botao.addEventListener('click', () => {
        document.getElementById('titulo-form-checklist').textContent = 'Editar checklist';
        document.getElementById('input-checklist-id-edicao').value = botao.dataset.id;
        document.getElementById('input-checklist-titulo').value = botao.dataset.titulo;
        document.getElementById('input-checklist-setor').value = botao.dataset.setor;
        document.getElementById('input-checklist-norma').value = botao.dataset.norma;
        document.getElementById('btn-salvar-checklist').textContent = 'Salvar Alterações';
        painel.classList.remove('hidden');
        painel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Botão "🗑️ Excluir": pede confirmação e faz uma EXCLUSÃO LÓGICA
    // (marca ativo = false) em vez de apagar a linha de verdade do banco.
    // Isso preserva o histórico de auditorias que já usaram esse checklist.
    document.querySelectorAll('.btn-excluir-checklist').forEach(botao => {
      botao.addEventListener('click', async () => {
        const confirmar = confirm(`Excluir o checklist "${botao.dataset.titulo}"? Auditorias já feitas com ele continuam salvas no histórico.`);
        if (!confirmar) return;

        const { error } = await supabaseClient
          .from('checklists_templates')
          .update({ ativo: false })
          .eq('id', botao.dataset.id);

        if (error) {
          alert(`Erro ao excluir: ${error.message}`);
          return;
        }

        renderizarTelaAdminChecklists();
      });
    });

    // Botão "Salvar": decide sozinho se CRIA um checklist novo ou
    // ATUALIZA um existente, olhando se o campo escondido tem um id.
    document.getElementById('btn-salvar-checklist').addEventListener('click', async () => {
      const idEmEdicao = document.getElementById('input-checklist-id-edicao').value;
      const titulo = document.getElementById('input-checklist-titulo').value.trim();
      const setor = document.getElementById('input-checklist-setor').value.trim() || null;
      const norma = document.getElementById('input-checklist-norma').value.trim() || null;
      const avisoEl = document.getElementById('aviso-form-checklist');

      if (!titulo) {
        avisoEl.textContent = 'Por favor, preencha o título do checklist.';
        avisoEl.classList.remove('hidden');
        return;
      }

      // Monta a operação certa: update() se já existe um id em edição,
      // insert() se o campo escondido estiver vazio (cadastro novo).
      const operacao = idEmEdicao
        ? supabaseClient.from('checklists_templates').update({ titulo, setor, norma_procedimento_base: norma }).eq('id', idEmEdicao)
        : supabaseClient.from('checklists_templates').insert({ titulo, setor, norma_procedimento_base: norma });

      const { error } = await operacao;

      if (error) {
        avisoEl.textContent = `Erro ao salvar: ${error.message}`;
        avisoEl.classList.remove('hidden');
        return;
      }

      renderizarTelaAdminChecklists();
    });

    // Clique no corpo do cartão (fora dos botões de editar/excluir):
    // abre a tela de gerenciamento de perguntas daquele checklist.
    document.querySelectorAll('.card-admin-checklist').forEach(cartao => {
      cartao.addEventListener('click', () => {
        renderizarTelaGerenciarPerguntas(cartao.dataset.id, cartao.dataset.titulo);
      });
    });
  }

  // ------------------------------------------------------------
  // Busca e lista as perguntas de UM checklist específico, com
  // formulário de criar/editar/excluir. Mesmo padrão das outras
  // telas de administração (Áreas, Checklists).
  // ------------------------------------------------------------
  async function renderizarTelaGerenciarPerguntas(checklistId, checklistTitulo) {
    conteudoApp.innerHTML = `<p class="text-gray-400">Carregando perguntas...</p>`;

    const { data: perguntas, error } = await supabaseClient
      .from('perguntas_template')
      .select('id, ordem, texto_pergunta, norma_regulamentadora_especifica, exige_foto, tipo_resposta')
      .eq('template_id', checklistId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      conteudoApp.innerHTML = `<p class="text-red-600">Erro ao carregar perguntas: ${error.message}</p>`;
      return;
    }

    // "Tradução" do código salvo no banco para o texto exibido na tela
    const rotulosTipoResposta = {
      conforme_nao_conforme: 'Conforme / Não Conforme',
      sim_nao: 'Sim / Não',
      nota: 'Nota (0 a 10)'
    };

    const listaHtml = (perguntas && perguntas.length > 0)
      ? perguntas.map((p, index) => `
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">${index + 1}. ${p.texto_pergunta}</p>
              <p class="text-xs text-gray-400 mt-1">
                ${p.norma_regulamentadora_especifica || 'sem norma vinculada'}
                · ${rotulosTipoResposta[p.tipo_resposta] || p.tipo_resposta}
                ${p.exige_foto ? ' · 📷 mostra opção de foto' : ''}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0 ml-3">
              <button class="btn-editar-pergunta text-gray-400 hover:text-marca-jb text-lg"
                data-id="${p.id}" data-ordem="${p.ordem}" data-texto="${p.texto_pergunta}"
                data-norma="${p.norma_regulamentadora_especifica || ''}" data-foto="${p.exige_foto}"
                data-tipo="${p.tipo_resposta}"
                title="Editar">✏️</button>
              <button class="btn-excluir-pergunta text-gray-400 hover:text-red-600 text-lg"
                data-id="${p.id}" data-texto="${p.texto_pergunta}"
                title="Excluir">🗑️</button>
            </div>
          </div>
        `).join('')
      : `<p class="text-gray-500">Nenhuma pergunta cadastrada ainda neste checklist.</p>`;

    // A próxima "ordem" sugerida é sempre a quantidade atual + 1
    const proximaOrdem = (perguntas ? perguntas.length : 0) + 1;

    conteudoApp.innerHTML = `
      <button id="btn-voltar-checklists" class="text-sm text-marca-jb mb-4 hover:underline">&larr; Voltar para Checklists</button>

      <div class="flex justify-between items-center mb-2">
        <h2 class="text-2xl font-bold text-marca-jb">${checklistTitulo}</h2>
        <button id="btn-abrir-form-pergunta" class="bg-marca-jb text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-marca-jb/90">
          + Nova Pergunta
        </button>
      </div>
      <p class="text-gray-500 mb-4">Gerencie as perguntas deste checklist.</p>

      <div id="painel-form-pergunta" class="hidden bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h3 id="titulo-form-pergunta" class="font-bold text-marca-jb mb-3">Cadastrar nova pergunta</h3>

        <input type="hidden" id="input-pergunta-id-edicao" value="">
        <input type="hidden" id="input-pergunta-ordem" value="${proximaOrdem}">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Texto da pergunta</label>
        <textarea id="input-pergunta-texto" rows="2" placeholder="Ex: A máquina possui proteção fixa em partes móveis?"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima"></textarea>

        <label class="block text-sm font-semibold text-gray-700 mb-1">Norma regulamentadora específica</label>
        <input id="input-pergunta-norma" type="text" placeholder="Ex: NR-12.2.1"
          class="w-full border border-gray-300 rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-marca-lima">

        <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo de resposta</label>
        <select id="select-pergunta-tipo-resposta" class="w-full border border-gray-300 rounded-lg p-2.5 mb-3">
          <option value="conforme_nao_conforme">Conforme / Não Conforme / N/A</option>
          <option value="sim_nao">Sim / Não / N/A</option>
          <option value="nota">Nota (0 a 10)</option>
        </select>

        <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <input type="checkbox" id="input-pergunta-foto" class="w-4 h-4">
          Mostrar opção de anexar foto nesta pergunta
        </label>

        <div id="aviso-form-pergunta" class="hidden bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-3"></div>

        <div class="flex gap-2">
          <button id="btn-salvar-pergunta" class="bg-marca-lima text-marca-jb font-bold px-4 py-2 rounded-lg hover:opacity-90">
            Salvar Pergunta
          </button>
          <button id="btn-cancelar-pergunta" class="text-gray-500 text-sm px-4 py-2 hover:underline">
            Cancelar
          </button>
        </div>
      </div>

      <div>${listaHtml}</div>
    `;

    document.getElementById('btn-voltar-checklists').addEventListener('click', () => {
      renderizarTelaAdminChecklists();
    });

    ligarEventosTelaGerenciarPerguntas(checklistId, checklistTitulo, proximaOrdem);
  }

  // ------------------------------------------------------------
  // Liga os cliques da tela de perguntas: abrir/cancelar formulário,
  // salvar (criar OU editar) e excluir (lógica, ativo = false).
  // ------------------------------------------------------------
  function ligarEventosTelaGerenciarPerguntas(checklistId, checklistTitulo, proximaOrdem) {
    const painel = document.getElementById('painel-form-pergunta');

    document.getElementById('btn-abrir-form-pergunta').addEventListener('click', () => {
      document.getElementById('titulo-form-pergunta').textContent = 'Cadastrar nova pergunta';
      document.getElementById('input-pergunta-id-edicao').value = '';
      document.getElementById('input-pergunta-ordem').value = proximaOrdem;
      document.getElementById('input-pergunta-texto').value = '';
      document.getElementById('input-pergunta-norma').value = '';
      document.getElementById('select-pergunta-tipo-resposta').value = 'conforme_nao_conforme';
      document.getElementById('input-pergunta-foto').checked = false;
      document.getElementById('btn-salvar-pergunta').textContent = 'Salvar Pergunta';
      painel.classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-pergunta').addEventListener('click', () => {
      painel.classList.add('hidden');
    });

    document.querySelectorAll('.btn-editar-pergunta').forEach(botao => {
      botao.addEventListener('click', () => {
        document.getElementById('titulo-form-pergunta').textContent = 'Editar pergunta';
        document.getElementById('input-pergunta-id-edicao').value = botao.dataset.id;
        document.getElementById('input-pergunta-ordem').value = botao.dataset.ordem;
        document.getElementById('input-pergunta-texto').value = botao.dataset.texto;
        document.getElementById('input-pergunta-norma').value = botao.dataset.norma;
        document.getElementById('select-pergunta-tipo-resposta').value = botao.dataset.tipo;
        document.getElementById('input-pergunta-foto').checked = (botao.dataset.foto === 'true');
        document.getElementById('btn-salvar-pergunta').textContent = 'Salvar Alterações';
        painel.classList.remove('hidden');
        painel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.querySelectorAll('.btn-excluir-pergunta').forEach(botao => {
      botao.addEventListener('click', async () => {
        const confirmar = confirm(`Excluir a pergunta "${botao.dataset.texto}"? Auditorias já feitas com ela continuam salvas no histórico.`);
        if (!confirmar) return;

        const { error } = await supabaseClient
          .from('perguntas_template')
          .update({ ativo: false })
          .eq('id', botao.dataset.id);

        if (error) {
          alert(`Erro ao excluir: ${error.message}`);
          return;
        }

        renderizarTelaGerenciarPerguntas(checklistId, checklistTitulo);
      });
    });

    document.getElementById('btn-salvar-pergunta').addEventListener('click', async () => {
      const idEmEdicao = document.getElementById('input-pergunta-id-edicao').value;
      const texto = document.getElementById('input-pergunta-texto').value.trim();
      const norma = document.getElementById('input-pergunta-norma').value.trim() || null;
      const tipoResposta = document.getElementById('select-pergunta-tipo-resposta').value;
      const exigeFoto = document.getElementById('input-pergunta-foto').checked;
      const ordem = parseInt(document.getElementById('input-pergunta-ordem').value, 10) || proximaOrdem;
      const avisoEl = document.getElementById('aviso-form-pergunta');

      if (!texto) {
        avisoEl.textContent = 'Por favor, preencha o texto da pergunta.';
        avisoEl.classList.remove('hidden');
        return;
      }

      const dadosPergunta = {
        texto_pergunta: texto,
        norma_regulamentadora_especifica: norma,
        tipo_resposta: tipoResposta,
        exige_foto: exigeFoto,
        ordem: ordem
      };

      const operacao = idEmEdicao
        ? supabaseClient.from('perguntas_template').update(dadosPergunta).eq('id', idEmEdicao)
        : supabaseClient.from('perguntas_template').insert({ ...dadosPergunta, template_id: checklistId });

      const { error } = await operacao;

      if (error) {
        avisoEl.textContent = `Erro ao salvar: ${error.message}`;
        avisoEl.classList.remove('hidden');
        return;
      }

      renderizarTelaGerenciarPerguntas(checklistId, checklistTitulo);
    });
  }

  // ------------------------------------------------------------
  // Função que efetivamente troca a tela.
  // Repare: ela só mexe em "conteudoApp", nunca no app-shell inteiro.
  // ------------------------------------------------------------
  function navegarPara(nomeRota) {
    // 1. Busca a função da rota pedida (ou usa 'dashboard' como padrão)
    const funcaoDaTela = rotas[nomeRota] || rotas['dashboard'];

    // 2. Executa a função da tela.
    //    - Telas simples (dashboard, planos-acao) devolvem um texto HTML pronto:
    //      nesse caso, colocamos esse texto na tela.
    //    - Telas que buscam dados no Supabase (nova-auditoria) já escrevem
    //      o conteúdo sozinhas quando terminam de carregar; nesse caso,
    //      o resultado da função é uma "Promise" (uma promessa de valor futuro)
    //      e não fazemos nada aqui, só deixamos ela rodar.
    const resultado = funcaoDaTela();
    if (typeof resultado === 'string') {
      conteudoApp.innerHTML = resultado;
    }

    // 3. Atualiza visualmente qual item do menu está "ativo"
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.classList.toggle('ativo', btn.dataset.rota === nomeRota);
    });
  }

  // ------------------------------------------------------------
  // Controle da sidebar-gaveta no celular: abrir, fechar, e
  // fechar automaticamente depois de escolher uma opção do menu.
  // ------------------------------------------------------------
  const sidebarEl = document.getElementById('sidebar');
  const overlaySidebarEl = document.getElementById('overlay-sidebar');

  function abrirMenuMobile() {
    sidebarEl.classList.remove('-translate-x-full');
    overlaySidebarEl.classList.remove('hidden');
  }

  function fecharMenuMobile() {
    sidebarEl.classList.add('-translate-x-full');
    overlaySidebarEl.classList.add('hidden');
  }

  document.getElementById('btn-abrir-menu-mobile').addEventListener('click', abrirMenuMobile);

  // Tocar no fundo escurecido também fecha a sidebar
  overlaySidebarEl.addEventListener('click', fecharMenuMobile);

  // ------------------------------------------------------------
  // Liga um "escutador de clique" em cada botão do menu.
  // Quando clicado, chama navegarPara() com a rota daquele botão,
  // e fecha a sidebar-gaveta (no celular; no computador não faz diferença,
  // já que lá ela fica sempre visível de qualquer forma).
  // ------------------------------------------------------------
  document.querySelectorAll('.menu-item').forEach(botao => {
    botao.addEventListener('click', () => {
      navegarPara(botao.dataset.rota);
      fecharMenuMobile();
    });
  });

  // MODO OFFLINE — Bloco 5: liga os gatilhos que disparam a sincronização
  // automática da fila — quando o navegador avisa que a conexão voltou,
  // e periodicamente (a cada 30s) como segurança, já que celular nem
  // sempre avisa direito quando a internet volta.
  window.addEventListener('online', processarFilaDeSincronizacao);
  setInterval(processarFilaDeSincronizacao, 30000);
  processarFilaDeSincronizacao(); // também tenta uma vez já ao abrir o app

  // MODO OFFLINE — Bloco 6: mostra o badge de pendências já na abertura do
  // app, mesmo se estiver offline (nesse caso, processarFilaDeSincronizacao
  // acima nem chega a rodar, então precisa ser chamado aqui também).
  atualizarBadgeFila();

  // Ao abrir o app pela primeira vez, mostra o Dashboard
  navegarPara('dashboard');
</script>

</body>
</html>
