// src/components/NucleoCard.jsx

const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');
};

function NucleoCard({ nucleo, onView, onEdit, onDelete }) {
    const FASES = ["Instauração", "Notificação e Buscas", "Urbanismo", "Ambiental", "Jurídico", "Cartório", "Titulação", "Finalizado"];
    const { nome, decreto, dataInstauracao, fase, pendencia } = nucleo;

    const faseAtualIndex = FASES.findIndex(f => f === fase?.nome);
    const progresso = faseAtualIndex >= 0 ? ((faseAtualIndex + 1) / FASES.length) * 100 : 0;
    const faseClassName = fase?.nome ? 'fase-' + normalizarTexto(fase.nome) : '';
    const pendenciaInfo = pendencia?.ativa ? <span className="pendencia-tag sim">Sim</span> : <span className="pendencia-tag nao">Não</span>;
    const dataInstauracaoFormatada = new Date(dataInstauracao + 'T03:00:00Z').toLocaleDateString('pt-BR');
    const dataFaseFormatada = fase?.data ? new Date(fase.data).toLocaleDateString('pt-BR') : 'N/A';

    return (
        <div className="nucleo-card" onClick={onView}>
            <div className="card-header">
                <h2>{nome}</h2>
                <p>Decreto {decreto} • Início em {dataInstauracaoFormatada}</p>
            </div>
            <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progresso}%` }}></div></div>
            <div className="card-body">
                <div className="info-item"><span className="label">Fase Atual:</span><span className={`value status-tag ${faseClassName}`}>{fase?.nome || 'Indefinida'}</span></div>
                <div className="info-item"><span className="label">Responsável:</span><span className="value">{fase?.atribuidoA || 'N/A'}</span></div>
                <div className="info-item"><span className="label">Data da Fase:</span><span className="value">{dataFaseFormatada}</span></div>
                <div className="info-item"><span className="label">Pendência:</span><span className="value">{pendenciaInfo}</span></div>
            </div>
            <div className="card-footer">
                <button className="icon-btn edit-btn" title="Gerenciar Fases e Pendências" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    {/* O 'viewBox' PRECISA TER 4 NÚMEROS: "0 0 24 24" */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className="icon-btn delete-btn" title="Excluir Núcleo" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </div>
    );
}
export default NucleoCard;