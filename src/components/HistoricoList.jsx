// src/components/HistoricoList.jsx

import React, { useState, useEffect } from 'react';
import { nucleosCollection } from '../firebase/config';
import { FiClock } from 'react-icons/fi';

function HistoricoList({ nucleoId }) {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!nucleoId) return;

        const unsubscribe = nucleosCollection
            .doc(nucleoId)
            .collection('historico')
            .orderBy('data', 'desc') // Ordena para mostrar o mais recente primeiro
            .onSnapshot(snapshot => {
                const eventos = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Converte o Timestamp do Firebase para um objeto Date do JS
                        data: data.data ? data.data.toDate() : new Date()
                    };
                });
                setHistorico(eventos);
                setLoading(false);
            });

        // Limpa o listener quando o componente é desmontado
        return () => unsubscribe();
    }, [nucleoId]);

    if (loading) {
        return <p className="historico-info">Carregando histórico...</p>;
    }

    if (historico.length === 0) {
        return <p className="historico-info">Nenhuma alteração registrada para este núcleo.</p>;
    }

    return (
        <div className="historico-list">
            {historico.map(evento => (
                <div key={evento.id} className="historico-item">
                    <div className="historico-icon">
                        <FiClock size={16} />
                    </div>
                    <div className="historico-content">
                        <p className="historico-acao">{evento.acao}</p>
                        <p className="historico-meta">
                            por <strong>{evento.alteradoPor}</strong> em {evento.data.toLocaleDateString('pt-BR')} às {evento.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HistoricoList;