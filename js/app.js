let proyectosData = [];

// Cargar los datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/datos.json')
        .then(response => response.json())
        .then(data => {
            proyectosData = data;
            renderizarTarjetas(proyectosData);
        })
        .catch(error => console.error('Error cargando los datos:', error));
});

function renderizarTarjetas(proyectos) {
    const contenedor = document.getElementById('contenedor-enlaces');
    contenedor.innerHTML = ''; // Limpiar contenedor

    proyectos.forEach(proyecto => {
        // Crear etiquetas ("badges") basadas en tus columnas del Drive
        let badges = '';
        if (proyecto.gratuita) badges += '<span class="badge gratis">Gratis</span>';
        if (proyecto.cyt) badges += '<span class="badge cyt">CyT</span>';
        if (proyecto.matematica) badges += '<span class="badge mat">Matemática</span>';
        if (proyecto.programacion) badges += '<span class="badge prog">Programación</span>';
        
        // Etiqueta de idioma extraída del código fuente
        badges += `<span class="badge lang">${proyecto.idioma}</span>`;

        const card = `
            <div class="card">
                <img src="${proyecto.imagen}" alt="${proyecto.nombre}">
                <div class="card-body">
                    <div class="badges">${badges}</div>
                    <h3>${proyecto.nombre}</h3>
                    <p>${proyecto.descripcion.substring(0, 100)}...</p>
                    <a href="${proyecto.url}" target="_blank" class="btn-visitar">Explorar Recurso</a>
                </div>
            </div>
        `;
        contenedor.innerHTML += card;
    });
}

// Lógica de los botones de filtro
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Quitar clase active de todos y ponerla al clickeado
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filtro = e.target.getAttribute('data-filter');
        
        if (filtro === 'all') {
            renderizarTarjetas(proyectosData);
        } else {
            // Filtrar el array basado en el atributo booleano (ej. proyecto.gratuita === true)
            const filtrados = proyectosData.filter(p => p[filtro] === true);
            renderizarTarjetas(filtrados);
        }
    });
});
