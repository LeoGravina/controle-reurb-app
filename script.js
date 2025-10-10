document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAÇÃO DO FIREBASE (Sua chave já está incluída) ---
    const firebaseConfig = {
        apiKey: "AIzaSyByqtK3WiTOj-OChgmzR_TJvsQP_YTAOo4",
        authDomain: "controle-reurb-5fd56.firebaseapp.com",
        projectId: "controle-reurb-5fd56",
        storageBucket: "controle-reurb-5fd56.appspot.com",
        messagingSenderId: "295943977011",
        appId: "1:295943977011:web:d7eaa507d7a4c428ca0b46"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const nucleosCollection = db.collection("nucleos");

    // --- 2. ELEMENTOS DO DOM ---
    const themeToggle = document.getElementById('theme-toggle');
    const nucleosGrid = document.getElementById('nucleosGrid');
    const buscaInput = document.getElementById('buscaInput');
    const filtroFase = document.getElementById('filtroFase');
    const abrirModalBtn = document.getElementById('abrirModalBtn');
    const nucleoModal = document.getElementById('nucleoModal');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const nucleoForm = document.getElementById('nucleoForm');
    const gerenciarModal = document.getElementById('gerenciarModal');
    const fecharGerenciarModalBtn = document.getElementById('fecharGerenciarModalBtn');
    const gerenciarModalTitle = document.getElementById('gerenciarModalTitle');
    const gerenciarNucleoId = document.getElementById('gerenciarNucleoId');
    const faseSelect = document.getElementById('faseSelect');
    const atribuidoInput = document.getElementById('atribuidoInput');
    const salvarFaseBtn = document.getElementById('salvarFaseBtn');
    const pendenciaStatus = document.getElementById('pendenciaStatus');
    const lancarPendenciaArea = document.getElementById('lancarPendenciaArea');
    const pendenciaInput = document.getElementById('pendenciaInput');
    const lancarPendenciaBtn = document.getElementById('lancarPendenciaBtn');
    const resolverPendenciaBtn = document.getElementById('resolverPendenciaBtn');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const responsavelInput = document.getElementById('responsavelInput');
    const toast = document.getElementById('toast');

    // --- 3. DADOS E VARIÁVEIS ---
    const fases = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];
    let todosNucleos = []; 

    // Popula os menus suspensos de fases
    filtroFase.innerHTML = `<option value="todas">Todas as Fases</option>`;
    fases.forEach(fase => {
        const option = document.createElement('option');
        option.value = fase;
        option.textContent = fase;
        faseSelect.appendChild(option.cloneNode(true));
        filtroFase.appendChild(option);
    });

    // --- 4. FUNÇÕES AUXILIARES ---
    const showToast = (message) => {
        toast.textContent = message;
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    };

    const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.checked = theme === 'dark';
    };
    themeToggle.addEventListener('change', () => { setTheme(themeToggle.checked ? 'dark' : 'light'); });
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) { setTheme(savedTheme); } else if (userPrefersDark) { setTheme('dark'); }

    // --- 5. RENDERIZAÇÃO ---
    const renderizarGrid = (nucleos) => {
        nucleosGrid.innerHTML = ''; 
        if (nucleos.length === 0) { nucleosGrid.innerHTML = `<p style="color: var(--text-light); text-align: center;">Nenhum núcleo encontrado.</p>`; return; }
        
        nucleos.forEach(nucleoDoc => {
            const nucleo = nucleoDoc.data();
            const card = document.createElement('div');
            card.className = 'nucleo-card';
            card.dataset.id = nucleoDoc.id;

            let statusTag = `<span class="value status-tag">Indefinida</span>`;
            if (nucleo.fase && nucleo.fase.nome) {
                const faseClassName = 'fase-' + normalizarTexto(nucleo.fase.nome);
                statusTag = `<span class="value status-tag ${faseClassName}">${nucleo.fase.nome}</span>`;
            }

            const pendenciaInfo = nucleo.pendencia && nucleo.pendencia.ativa ? `<span class="pendencia-tag sim">Sim</span>` : `<span class="pendencia-tag nao">Não</span>`;
            const dataInstauracaoFormatada = new Date(nucleo.dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR');
            const dataFaseFormatada = (nucleo.fase && nucleo.fase.data) ? new Date(nucleo.fase.data).toLocaleDateString('pt-BR') : 'N/A';
            
            card.innerHTML = `
                <div class="card-header"><h2>${nucleo.nome}</h2><p>Decreto ${nucleo.decreto} • Início em ${dataInstauracaoFormatada}</p></div>
                <div class="card-body">
                    <div class="info-item"><span class="label">Fase Atual:</span>${statusTag}</div>
                    <div class="info-item"><span class="label">Responsável:</span><span class="value">${(nucleo.fase && nucleo.fase.atribuidoA) || 'N/A'}</span></div>
                    <div class="info-item"><span class="label">Data da Fase:</span><span class="value">${dataFaseFormatada}</span></div>
                    <div class="info-item"><span class="label">Pendência:</span><span class="value">${pendenciaInfo}</span></div>
                </div>
                <div class="card-footer">
                    <button class="icon-btn edit-btn" title="Gerenciar Fases e Pendências"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="icon-btn delete-btn" title="Excluir Núcleo"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </div>`;
            nucleosGrid.appendChild(card);
        });
    };

    // --- 6. LÓGICA DO FIREBASE E FILTROS ---
    nucleosCollection.orderBy("nome").onSnapshot(snapshot => { todosNucleos = snapshot.docs; aplicarFiltroERenderizar(); });
    
    const aplicarFiltroERenderizar = () => {
        const termoBusca = buscaInput.value.toLowerCase().trim();
        const faseSelecionada = filtroFase.value;
        let nucleosFiltrados = todosNucleos;

        if (termoBusca) {
            nucleosFiltrados = nucleosFiltrados.filter(doc => {
                const nucleo = doc.data();
                return nucleo.nome.toLowerCase().includes(termoBusca) || nucleo.decreto.toLowerCase().includes(termoBusca);
            });
        }

        if (faseSelecionada !== "todas") {
            nucleosFiltrados = nucleosFiltrados.filter(doc => doc.data().fase && doc.data().fase.nome === faseSelecionada);
        }

        renderizarGrid(nucleosFiltrados);
    };
    
    buscaInput.addEventListener('input', aplicarFiltroERenderizar);
    filtroFase.addEventListener('change', aplicarFiltroERenderizar);

    // --- 7. EVENT LISTENERS ---
    abrirModalBtn.addEventListener('click', () => { nucleoForm.reset(); nucleoModal.showModal(); });
    fecharModalBtn.addEventListener('click', () => nucleoModal.close());
    nucleoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const responsavel = responsavelInput.value;
        if (!responsavel) { showToast("Por favor, preencha o nome do responsável."); return; }
        const novoNucleo = { nome: document.getElementById('nomeNucleo').value, dataInstauracao: document.getElementById('dataInstauracao').value, decreto: document.getElementById('decretoInstauracao').value, fase: { nome: fases[0], atribuidoA: responsavel, data: new Date().toISOString() }, pendencia: { ativa: false, descricao: "", data: "", resolvida: true } };
        nucleosCollection.add(novoNucleo).then(() => { nucleoModal.close(); showToast("Núcleo criado com sucesso!"); });
    });

    nucleosGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.nucleo-card');
        if (!card) return;
        const id = card.dataset.id;
        if (e.target.closest('.delete-btn')) { confirmDeleteBtn.dataset.docId = id; confirmDeleteModal.showModal(); }
        if (e.target.closest('.edit-btn')) {
            const doc = await nucleosCollection.doc(id).get();
            const nucleo = doc.data();
            gerenciarModalTitle.textContent = `Gerenciar: ${nucleo.nome}`;
            gerenciarNucleoId.value = id;
            faseSelect.value = (nucleo.fase && nucleo.fase.nome) || fases[0];
            atribuidoInput.value = (nucleo.fase && nucleo.fase.atribuidoA) || '';
            if (nucleo.pendencia && nucleo.pendencia.ativa) {
                pendenciaStatus.textContent = `Status: Pendência ativa - "${nucleo.pendencia.descricao}"`;
                lancarPendenciaArea.style.display = 'none';
                resolverPendenciaBtn.style.display = 'block';
            } else {
                pendenciaStatus.textContent = "Status: Sem pendências.";
                lancarPendenciaArea.style.display = 'block';
                pendenciaInput.value = '';
                resolverPendenciaBtn.style.display = 'none';
            }
            gerenciarModal.showModal();
        }
    });

    fecharGerenciarModalBtn.addEventListener('click', () => gerenciarModal.close());
    salvarFaseBtn.addEventListener('click', async () => {
        const id = gerenciarNucleoId.value;
        await nucleosCollection.doc(id).update({ 'fase.nome': faseSelect.value, 'fase.atribuidoA': atribuidoInput.value, 'fase.data': new Date().toISOString() });
        gerenciarModal.close();
        showToast("Fase atualizada com sucesso!");
    });
    lancarPendenciaBtn.addEventListener('click', async () => {
        const id = gerenciarNucleoId.value;
        if (!pendenciaInput.value) { showToast("Por favor, descreva a pendência."); return; }
        await nucleosCollection.doc(id).update({ 'pendencia.ativa': true, 'pendencia.descricao': pendenciaInput.value, 'pendencia.data': new Date().toISOString(), 'pendencia.resolvida': false });
        gerenciarModal.close();
        showToast("Pendência lançada!");
    });
    resolverPendenciaBtn.addEventListener('click', async () => {
        const id = gerenciarNucleoId.value;
        await nucleosCollection.doc(id).update({ 'pendencia.ativa': false, 'pendencia.resolvida': true });
        gerenciarModal.close();
        showToast("Pendência resolvida!");
    });

    cancelDeleteBtn.addEventListener('click', () => confirmDeleteModal.close());
    confirmDeleteBtn.addEventListener('click', async () => {
        const id = confirmDeleteBtn.dataset.docId;
        await nucleosCollection.doc(id).delete();
        confirmDeleteModal.close();
        showToast("Núcleo excluído com sucesso.");
    });
});

