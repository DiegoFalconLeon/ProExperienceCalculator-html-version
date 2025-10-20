// Internationalization variables
let currentLanguage = localStorage.getItem('language') || 'es';
let translations = {};

// Load translations and initialize app
async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateUI();
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function updateUI() {
    // Update document title
    document.title = translations.title;

    // Update html lang attribute
    document.documentElement.lang = currentLanguage;

    // Update all elements with data-i18n attributes
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

    // Update language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
    }

    // Update dynamic content (buttons, indicators, total cells, etc.)
    updateDynamicContent();

    // Recalculate totals to update with new language
    calculateTotal('specific');
    calculateTotal('general');
}

function updateDynamicContent() {
    // Update remove buttons
    document.querySelectorAll('.remove-row-btn').forEach(btn => {
        btn.textContent = translations.remove;
    });

    // Update readonly indicators
    document.querySelectorAll('.readonly-indicator').forEach(indicator => {
        indicator.textContent = translations.readOnly;
    });

    // Update all total cells with current translations
    document.querySelectorAll('.total-cell').forEach(cell => {
        const row = cell.closest('tr');
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = new Date(dateInputs[0].value);
        const endDate = new Date(dateInputs[1].value);

        if (startDate && endDate && startDate <= endDate) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const period = daysToYearsMonthsDays(diffDays);
            cell.textContent = `${period.years} ${translations.years.toLowerCase()}, ${period.months} ${translations.months.toLowerCase()}, ${period.days} ${translations.days.toLowerCase()}`;
        } else {
            cell.textContent = `0 ${translations.years.toLowerCase()}, 0 ${translations.months.toLowerCase()}, 0 ${translations.days.toLowerCase()}`;
        }
    });
}

function changeLanguage(lang) {
    if (lang !== currentLanguage) {
        loadTranslations(lang);
    }
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

    // Initialize tables
    initializeTable('specific', 1);
    syncSpecificToGeneral();
    toggleClearButtonVisibility('specific');
    toggleClearButtonVisibility('general');

    // Check if there's a calculation to load from sessionStorage
    loadCalculationFromSession();
});

function loadCalculationFromSession() {
    const calculationData = sessionStorage.getItem('loadCalculation');
    if (calculationData) {
        const calculation = JSON.parse(calculationData);

        // Clear sessionStorage
        sessionStorage.removeItem('loadCalculation');

        // Guardar datos para edición futura
        sessionStorage.setItem('editingCalculation', JSON.stringify(calculation));

        // Load specific data
        if (calculation.specificData && calculation.specificData.length > 0) {
            // Clear existing rows
            const specificTbody = document.getElementById('specific-tbody');
            specificTbody.innerHTML = '';

            // Add rows with data
            calculation.specificData.forEach(data => {
                const row = addTableRow('specific', specificTbody, false, data.startDate, data.endDate);
            });
        }

        // Load general data (only editable rows)
        if (calculation.generalData && calculation.generalData.length > 0) {
            // Clear existing editable rows
            const generalTbody = document.getElementById('general-tbody');
            const editableRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
            editableRows.forEach(row => row.remove());

            // Add editable rows with data
            calculation.generalData.forEach(data => {
                addTableRow('general', generalTbody, false, data.startDate, data.endDate);
            });
        }

        // Recalculate totals
        calculateTotal('specific');
        calculateTotal('general');

        // Change language if needed
        if (calculation.language && calculation.language !== currentLanguage) {
            changeLanguage(calculation.language);
        }

        // Show success message
        Swal.fire(
            translations.loadCalculation || 'Cálculo Cargado',
            `${translations.loadCalculation || 'Cálculo de'} ${calculation.firstName} ${calculation.lastName} ${'cargado correctamente' || 'loaded successfully'}`,
            'success'
        );
    }
}

function initializeTable(tableType, rowCount) {
    const tbody = document.getElementById(`${tableType}-tbody`);
    for (let i = 0; i < rowCount; i++) {
        addTableRow(tableType, tbody);
    }
}

function addTableRow(tableType, tbody, isReadonly = false, startDate = '', endDate = '') {
    const row = document.createElement('tr');
    if (isReadonly) {
        row.classList.add('readonly-row');
    }
    const totalId = `${tableType}-total-${Date.now()}`;
    row.innerHTML = `
        <td><input type="date" class="date-input ${isReadonly ? 'readonly' : ''}" onchange="calculateTotal('${tableType}')" value="${startDate}" ${isReadonly ? 'readonly' : ''}></td>
        <td><input type="date" class="date-input ${isReadonly ? 'readonly' : ''}" onchange="calculateTotal('${tableType}')" value="${endDate}" ${isReadonly ? 'readonly' : ''}></td>
        <td class="total-cell" id="${totalId}">${translations.years ? `0 ${translations.years.toLowerCase()}, 0 ${translations.months.toLowerCase()}, 0 ${translations.days.toLowerCase()}` : '0 años, 0 meses, 0 días'}</td>
        <td class="actions-cell">
            ${isReadonly ? `<span class="readonly-indicator">${translations.readOnly}</span>` : `<button class="remove-row-btn" onclick="removeRow(this)">${translations.remove}</button>`}
        </td>
    `;
    tbody.appendChild(row);

    // Calcular el total si hay fechas
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start && end && start <= end) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const period = daysToYearsMonthsDays(diffDays);
            document.getElementById(totalId).textContent = `${period.years} ${translations.years.toLowerCase()}, ${period.months} ${translations.months.toLowerCase()}, ${period.days} ${translations.days.toLowerCase()}`;
        }
    }

    return row;
}

function addRow(tableType) {
    const tbody = document.getElementById(`${tableType}-tbody`);

    if (tableType === 'general') {
        // Para general, añadir la fila editable al final (después de las filas de solo lectura)
        addTableRow('general', tbody, false);
        // Asegurar que esté al final
        const newRow = tbody.lastElementChild;
        tbody.appendChild(newRow);
    } else {
        // Para específica, añadir normalmente
        addTableRow(tableType, tbody, false);
    }

    toggleClearButtonVisibility(tableType);
}

function clearFields(tableType) {
    const tableName = tableType === 'specific' ? translations.specificExperience : translations.generalExperience;

    Swal.fire({
        title: translations.confirmClearTitle,
        text: translations.confirmClearText.replace('{tableName}', tableName),
        icon: 'question',
        showCancelButton: true,
        customClass: {
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        confirmButtonText: translations.confirmButton.replace('{action}', translations.clearFields.toLowerCase()),
        cancelButtonText: translations.cancelButton
    }).then((result) => {
        if (result.isConfirmed) {
            const tbody = document.getElementById(`${tableType}-tbody`);
            const rows = tbody.querySelectorAll('tr:not(.readonly-row)');
            rows.forEach(row => {
                const dateInputs = row.querySelectorAll('.date-input:not(.readonly)');
                dateInputs.forEach(input => {
                    input.value = '';
                });
            });
            calculateTotal(tableType);

            Swal.fire(
                translations.clearedTitle,
                translations.clearedText,
                'success'
            );

            toggleClearButtonVisibility(tableType);
        }
    });
}

function syncSpecificToGeneral() {
    const specificTbody = document.getElementById('specific-tbody');
    const generalTbody = document.getElementById('general-tbody');

    // Limpiar filas de solo lectura existentes en general
    const readonlyRows = generalTbody.querySelectorAll('.readonly-row');
    readonlyRows.forEach(row => row.remove());

    // Añadir filas específicas como de solo lectura en general (al principio)
    const specificRows = specificTbody.querySelectorAll('tr');
    let hasSpecificRows = false;
    specificRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;

        if (startDate && endDate) {
            addTableRow('general', generalTbody, true, startDate, endDate);
            hasSpecificRows = true;
        }
    });

    // Gestionar filas editables
    const editableRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');

    if (editableRows.length === 0) {
        // Si no hay filas editables, añadir una
        addTableRow('general', generalTbody, false);
    } else if (editableRows.length > 1) {
        // Si hay múltiples filas editables, mantener solo una al final
        for (let i = 0; i < editableRows.length - 1; i++) {
            editableRows[i].remove();
        }
        // Asegurar que la fila editable esté al final
        const lastEditableRow = editableRows[editableRows.length - 1];
        generalTbody.appendChild(lastEditableRow);
    } else {
        // Si hay exactamente una fila editable, asegurarse de que esté al final
        generalTbody.appendChild(editableRows[0]);
    }

    toggleClearButtonVisibility('general');
}

function removeRow(button) {
    const row = button.closest('tr');
    const tableType = row.closest('tbody').id.replace('-tbody', '');

    // No permitir eliminar filas de solo lectura
    if (row.classList.contains('readonly-row')) {
        return;
    }

    // Verificar si la fila tiene datos
    const dateInputs = row.querySelectorAll('.date-input');
    const hasData = Array.from(dateInputs).some(input => input.value.trim() !== '');

    if (hasData) {
        // Si tiene datos, mostrar confirmación
        const tableName = tableType === 'specific' ? translations.specificExperience : translations.generalExperience;

        Swal.fire({
            title: translations.confirmDeleteTitle,
            text: translations.confirmDeleteText.replace('{tableName}', tableName),
            icon: 'warning',
            showCancelButton: true,
            customClass: {
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            },
            confirmButtonText: translations.confirmButton.replace('{action}', translations.remove.toLowerCase()),
            cancelButtonText: translations.cancelButton
        }).then((result) => {
            if (result.isConfirmed) {
                removeRowConfirmed(row, tableType);
            }
        });
    } else {
        // Si no tiene datos, eliminar directamente
        removeRowConfirmed(row, tableType);
    }
}

function removeRowConfirmed(row, tableType) {
    // Verificar si la fila tenía datos antes de eliminar
    const dateInputs = row.querySelectorAll('.date-input');
    const hadData = Array.from(dateInputs).some(input => input.value.trim() !== '');

    row.remove();
    calculateTotal(tableType);

    // Si se eliminó de específica, sincronizar con general
    if (tableType === 'specific') {
        syncSpecificToGeneral();
        calculateTotal('general');
        toggleClearButtonVisibility('general');
    } else if (tableType === 'general') {
        // Asegurar que siempre haya al menos una fila editable en general
        const generalTbody = document.getElementById('general-tbody');
        const editableRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
        if (editableRows.length === 0) {
            addTableRow('general', generalTbody, false);
        }
    }

    toggleClearButtonVisibility(tableType);

    // Mostrar mensaje de éxito solo si la fila tenía datos
    if (hadData) {
        Swal.fire(
            translations.deletedTitle,
            translations.deletedText,
            'success'
        );
    }
}

function calculateTotal(tableType) {
    const tbody = document.getElementById(`${tableType}-tbody`);
    const rows = tbody.querySelectorAll('tr');
    let dateRanges = [];

    // Recopilar todos los rangos de fechas válidos
    rows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = new Date(dateInputs[0].value);
        const endDate = new Date(dateInputs[1].value);

        if (startDate && endDate && startDate <= endDate) {
            dateRanges.push({
                start: new Date(startDate),
                end: new Date(endDate)
            });
        }
    });

    // Fusionar rangos solapados y calcular días totales únicos
    const mergedRanges = mergeOverlappingRanges(dateRanges);
    let totalDays = 0;

    mergedRanges.forEach(range => {
        const diffTime = Math.abs(range.end - range.start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        totalDays += diffDays;
    });

    const { years, months, days } = daysToYearsMonthsDays(totalDays);

    // Actualizar el resumen total
    document.getElementById(`${tableType}-total-years`).textContent = years;
    document.getElementById(`${tableType}-total-months`).textContent = months;
    document.getElementById(`${tableType}-total-days`).textContent = days;

    // Actualizar cada fila individualmente (sin considerar intersecciones para mostrar el cálculo individual)
    rows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const totalCell = row.querySelector('.total-cell');
        const startDate = new Date(dateInputs[0].value);
        const endDate = new Date(dateInputs[1].value);

        if (startDate && endDate && startDate <= endDate) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const period = daysToYearsMonthsDays(diffDays);
            totalCell.textContent = `${period.years} ${translations.years.toLowerCase()}, ${period.months} ${translations.months.toLowerCase()}, ${period.days} ${translations.days.toLowerCase()}`;
        } else {
            totalCell.textContent = `0 ${translations.years.toLowerCase()}, 0 ${translations.months.toLowerCase()}, 0 ${translations.days.toLowerCase()}`;
        }
    });

    // Si es tabla específica, sincronizar con general
    if (tableType === 'specific') {
        syncSpecificToGeneral();
        // Recalcular el total general después de sincronizar
        calculateTotal('general');
    }

    toggleClearButtonVisibility(tableType);
}

function daysToYearsMonthsDays(totalDays) {
    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    return { years, months, days };
}

function mergeOverlappingRanges(ranges) {
    if (ranges.length === 0) return [];

    // Ordenar rangos por fecha de inicio
    ranges.sort((a, b) => a.start - b.start);

    const merged = [ranges[0]];

    for (let i = 1; i < ranges.length; i++) {
        const current = ranges[i];
        const last = merged[merged.length - 1];

        // Si hay solapamiento o son adyacentes, fusionar
        if (current.start <= last.end) {
            last.end = new Date(Math.max(last.end, current.end));
        } else {
            // No hay solapamiento, agregar como nuevo rango
            merged.push(current);
        }
    }

    return merged;
}

function saveCalculation() {
    // Verificar si estamos editando un cálculo existente
    const editingCalculation = sessionStorage.getItem('editingCalculation');
    let existingData = null;
    
    if (editingCalculation) {
        existingData = JSON.parse(editingCalculation);
    }

    // Recopilar datos específicos
    const specificData = [];
    const specificRows = document.querySelectorAll('#specific-tbody tr');
    specificRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        if (startDate && endDate) {
            specificData.push({
                startDate: startDate,
                endDate: endDate
            });
        }
    });

    // Recopilar datos generales
    const generalData = [];
    const generalRows = document.querySelectorAll('#general-tbody tr');
    generalRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        if (startDate && endDate) {
            generalData.push({
                startDate: startDate,
                endDate: endDate
            });
        }
    });

    // Recopilar totales
    const totalSpecific = {
        years: document.getElementById('specific-total-years').textContent,
        months: document.getElementById('specific-total-months').textContent,
        days: document.getElementById('specific-total-days').textContent
    };

    const totalGeneral = {
        years: document.getElementById('general-total-years').textContent,
        months: document.getElementById('general-total-months').textContent,
        days: document.getElementById('general-total-days').textContent
    };

    // Si estamos editando, guardar directamente sin pedir datos
    if (existingData) {
        const updatedCalculation = {
            ...existingData,
            specificData: specificData,
            generalData: generalData,
            totalSpecific: totalSpecific,
            totalGeneral: totalGeneral,
            savedDate: new Date().toISOString(),
            language: currentLanguage
        };
        
        // Actualizar en localStorage
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        const index = savedCalculations.findIndex(calc => calc.id === existingData.id);
        if (index !== -1) {
            savedCalculations[index] = updatedCalculation;
            localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
        }
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('editingCalculation');
        
        // Mostrar mensaje de éxito y redirigir
        Swal.fire(
            translations.saveSuccessTitle,
            translations.saveSuccessText,
            'success'
        ).then(() => {
            // Limpiar todos los campos después de guardar
            clearAllFields();
            // Redirigir al index después de un breve delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
        return;
    }

    // Mostrar SweetAlert para ingresar datos (solo para nuevos cálculos)
    Swal.fire({
        title: translations.saveDialogTitle,
        html: `
            <div style="text-align: left;">
                <label for="registroNumber" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.registroNumber}:</label>
                <input id="registroNumber" class="swal2-input" placeholder="${translations.registroNumber}" style="width: 100%; margin-bottom: 15px;">
                
                <label for="firstName" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.firstName}:</label>
                <input id="firstName" class="swal2-input" placeholder="${translations.firstName}" style="width: 100%; margin-bottom: 15px;">
                
                <label for="lastName" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.lastName}:</label>
                <input id="lastName" class="swal2-input" placeholder="${translations.lastName}" style="width: 100%;">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: translations.confirmButton.replace('{action}', translations.saveCalculation.toLowerCase()),
        cancelButtonText: translations.cancelButton,
        customClass: {
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        preConfirm: () => {
            const registroNumber = document.getElementById('registroNumber').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            
            if (!registroNumber || !firstName || !lastName) {
                Swal.showValidationMessage(translations.saveErrorText);
                return false;
            }
            
            return { registroNumber, firstName, lastName };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { registroNumber, firstName, lastName } = result.value;
            
            // Crear objeto de cálculo
            const calculation = {
                id: Date.now(),
                registroNumber: registroNumber,
                firstName: firstName,
                lastName: lastName,
                specificData: specificData,
                generalData: generalData,
                totalSpecific: totalSpecific,
                totalGeneral: totalGeneral,
                savedDate: new Date().toISOString(),
                language: currentLanguage
            };
            
            // Guardar en localStorage
            const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
            savedCalculations.push(calculation);
            localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
            
            // Mostrar mensaje de éxito
            Swal.fire(
                translations.saveSuccessTitle,
                translations.saveSuccessText,
                'success'
            ).then(() => {
                // Limpiar todos los campos después de guardar
                clearAllFields();
                // Redirigir al index después de un breve delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            });
        }
    });
}

function toggleClearButtonVisibility(tableType) {
    const tbody = document.getElementById(`${tableType}-tbody`);
    const clearBtn = document.querySelector(`#${tableType}-table`).closest('.table-section').querySelector('.clear-btn');

    // Verificar si hay filas editables con datos
    const editableRows = tbody.querySelectorAll('tr:not(.readonly-row)');
    let hasData = false;

    editableRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input:not(.readonly)');
        if (Array.from(dateInputs).some(input => input.value.trim() !== '')) {
            hasData = true;
        }
    });

    // Mostrar/ocultar el botón
    if (hasData) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }
}

function clearAllFields() {
    // Limpiar tabla específica
    const specificTbody = document.getElementById('specific-tbody');
    const specificRows = specificTbody.querySelectorAll('tr');
    specificRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input:not(.readonly)');
        dateInputs.forEach(input => input.value = '');
    });

    // Limpiar tabla general (solo filas editables)
    const generalTbody = document.getElementById('general-tbody');
    const generalRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
    generalRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input:not(.readonly)');
        dateInputs.forEach(input => input.value = '');
    });

    // Recalcular totales
    calculateTotal('specific');
    calculateTotal('general');

    // Ocultar botones de limpiar
    toggleClearButtonVisibility('specific');
    toggleClearButtonVisibility('general');
}