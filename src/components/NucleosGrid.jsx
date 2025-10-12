import NucleoCard from './NucleoCard';

function NucleosGrid({ nucleos, onView, onEdit, onDelete }) {
    if (nucleos.length === 0) {
        return <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Nenhum núcleo encontrado.</p>;
    }
    return (
        <div id="nucleosGrid">
            {nucleos.map(nucleo => (
                <NucleoCard 
                    key={nucleo.id} 
                    nucleo={nucleo}
                    onView={() => onView(nucleo)}
                    onEdit={() => onEdit(nucleo)}
                    onDelete={() => onDelete(nucleo)}
                />
            ))}
        </div>
    );
}

export default NucleosGrid;