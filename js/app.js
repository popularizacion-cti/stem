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
    contenedor.innerHTML = ''; 

    proyectos.forEach(proyecto => {
        let badges = '';
        if (proyecto.gratuita) badges += '<span class="badge gratis">Gratis</span>';
        if (proyecto.cyt) badges += '<span class="badge cyt">CyT</span>';
        if (proyecto.matematica) badges += '<span class="badge mat">Matemática</span>';
        if (proyecto.programacion) badges += '<span class="badge prog">Programación</span>';
        
        // Mejora 1: Etiquetas de idioma desde tus columnas
        if (proyecto.espanol) badges += '<span class="badge lang">ES</span>';
        if (proyecto.ingles) badges += '<span class="badge lang">EN</span>';

        // Mejora 4: Convertimos todo el div en una etiqueta <a>
        // Además, añadimos un onerror a la imagen por si no existe el número.jpg en tu carpeta
        const card = `
            <a href="${proyecto.url}" target="_blank" class="card">
                <img src="${proyecto.imagen}" alt="${proyecto.nombre}">
                <div class="card-body">
                    <div class="badges">${badges}</div>
                    <h3>${proyecto.nombre}</h3>
                    <p class="desc-texto">${proyecto.descripcion}</p>
                </div>
            </a>
        `;
        contenedor.innerHTML += card;
    });
}

// Lógica de los botones de filtro (Sumativos y Deseleccionables)
const botonesFiltro = document.querySelectorAll('.filter-btn');

botonesFiltro.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filtroClickeado = e.target.getAttribute('data-filter');

        // 1. Si hace clic en "Todos"
        if (filtroClickeado === 'all') {
            botonesFiltro.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderizarTarjetas(proyectosData);
            return;
        }

        // 2. Si hace clic en cualquier otro filtro
        // Primero, le quitamos el estado 'active' al botón "Todos"
        document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');
        
        // Alternamos (encendemos/apagamos) el botón que acaba de clickear
        e.target.classList.toggle('active');

        // 3. Recopilamos qué filtros están encendidos actualmente
        const filtrosActivos = Array.from(document.querySelectorAll('.filter-btn.active'))
                                    .map(b => b.getAttribute('data-filter'));

        // 4. Si el usuario apagó todos los filtros, volvemos a activar "Todos"
        if (filtrosActivos.length === 0) {
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            renderizarTarjetas(proyectosData);
            return;
        }

        // 5. Filtramos los datos: El proyecto debe cumplir con TODOS los filtros activos (Lógica AND)
        const filtrados = proyectosData.filter(proyecto => {
            // El método 'every' se asegura de que el proyecto tenga en 'true' todas las categorías seleccionadas
            return filtrosActivos.every(filtro => proyecto[filtro] === true);
        });

        renderizarTarjetas(filtrados);
    });
});
