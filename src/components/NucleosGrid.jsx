// src/components/NucleosGrid.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NucleoCard from './NucleoCard';

// Variantes de animação para o container da lista
const listVariants = {
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.05, // Anima cada card com um pequeno atraso
        },
    },
    hidden: { opacity: 0 },
};

// Variantes de animação para cada card individual
const cardVariants = {
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    hidden: { opacity: 0, y: 20, scale: 0.98 },
};

function NucleosGrid({ nucleos, onView, onEdit, onDelete }) {
    if (nucleos.length === 0) {
        return <p style={{ color: 'var(--text-light)', textAlign: 'center', marginTop: '40px' }}>Nenhum núcleo encontrado para os filtros selecionados.</p>;
    }

    return (
        // motion.div é o container que orquestra a animação dos filhos
        <motion.div
            id="nucleosGrid"
            variants={listVariants}
            initial="hidden"
            animate="visible"
        >
            {/* AnimatePresence gerencia as animações de saída quando um item é removido */}
            <AnimatePresence>
                {nucleos.map(nucleo => (
                    // motion.div envolve cada card para animá-lo individualmente
                    <motion.div
                        key={nucleo.id}
                        variants={cardVariants}
                        layout // A propriedade 'layout' anima a mudança de posição dos cards
                        exit="hidden" // Define a animação de saída
                    >
                        <NucleoCard 
                            nucleo={nucleo}
                            onView={() => onView(nucleo)}
                            onEdit={() => onEdit(nucleo)}
                            onDelete={() => onDelete(nucleo)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}

export default NucleosGrid;