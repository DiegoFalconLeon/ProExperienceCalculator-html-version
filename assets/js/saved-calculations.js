// Variables de internacionalización
let currentLanguage = localStorage.getItem('language') || 'es';
let translations = {};
let dataTable = null;

// Cargar traducciones e inicializar aplicación
async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateUI();
        loadSavedCalculations();
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function updateUI() {
    // Actualizar título del documento
    document.title = translations.savedCalculations;

    // Actualizar atributo lang del html
    document.documentElement.lang = currentLanguage;

    // Actualizar todos los elementos con atributos data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[key];
            } else if (element.tagName === 'IMG') {
                element.alt = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });

    // Actualizar selector de idioma
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
    }
}

function changeLanguage(lang) {
    if (lang !== currentLanguage) {
        loadTranslations(lang);
    }
}

function loadSavedCalculations() {
    const tbody = document.getElementById('calculations-tbody');
    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');

    // Limpiar tabla existente
    tbody.innerHTML = '';

    if (savedCalculations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <p data-i18n="noSavedCalculations">${translations.noSavedCalculations || 'No hay cálculos guardados.'}</p>
                </td>
            </tr>
        `;
        return;
    }

    // Llenar filas de la tabla
    savedCalculations.forEach(calc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${calc.registroNumber || ''}</td>
            <td>${calc.lastName}</td>
            <td>${calc.firstName}</td>
            <td>${calc.totalSpecific.years} ${translations.years?.toLowerCase() || 'años'}, ${calc.totalSpecific.months} ${translations.months?.toLowerCase() || 'meses'}, ${calc.totalSpecific.days} ${translations.days?.toLowerCase() || 'días'}</td>
            <td>${calc.totalGeneral.years} ${translations.years?.toLowerCase() || 'años'}, ${calc.totalGeneral.months} ${translations.months?.toLowerCase() || 'meses'}, ${calc.totalGeneral.days} ${translations.days?.toLowerCase() || 'días'}</td>
            <td>
                <button class="edit-btn" onclick="editCalculation(${calc.id})" data-i18n="edit">${translations.edit || 'Editar'}</button>
                <button class="delete-btn" onclick="deleteCalculation(${calc.id})" data-i18n="delete">${translations.delete || 'Eliminar'}</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Inicializar o reinicializar DataTable
    if (dataTable) {
        dataTable.destroy();
    }

    dataTable = $('#saved-calculations-table').DataTable({
        language: {
            url: currentLanguage === 'es' ? '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' : '//cdn.datatables.net/plug-ins/1.13.4/i18n/en-GB.json'
        },
        pageLength: 10,
        responsive: true,
        columnDefs: [
            { orderable: false, targets: 5 } // Deshabilitar ordenamiento en columna de acciones
        ]
    });
}

function editCalculation(id) {
    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    const calculation = savedCalculations.find(calc => calc.id === id);

    if (calculation) {
        // Guardar el cálculo a cargar en sessionStorage para que el index.html lo recoja
        sessionStorage.setItem('loadCalculation', JSON.stringify(calculation));
        // Redirigir al index.html
        window.location.href = 'index.html';
    }
}

function deleteCalculation(id) {
    Swal.fire({
        title: translations.confirmDeleteCalcTitle || '¿Eliminar cálculo?',
        text: translations.confirmDeleteCalcText || '¿Está seguro de eliminar este cálculo?',
        icon: 'warning',
        showCancelButton: true,
        customClass: {
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        confirmButtonText: translations.confirmButton?.replace('{action}', translations.delete?.toLowerCase() || 'eliminar') || 'Sí, eliminar',
        cancelButtonText: translations.cancelButton || 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
            const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
            localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations));

            loadSavedCalculations();

            Swal.fire(
                translations.deletedCalcTitle || 'Eliminado',
                translations.deletedCalcText || 'El cálculo ha sido eliminado.',
                'success'
            );
        }
    });
}

// Initialize the app with translations
document.addEventListener('DOMContentLoaded', async function() {
    await loadTranslations(currentLanguage);

    // Set up language selector event listener
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    }
});