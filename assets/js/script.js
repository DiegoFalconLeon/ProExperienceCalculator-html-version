// Variables de internacionalización
let currentLanguage = localStorage.getItem('language') || 'es';
let translations = {};

// Cargar traducciones e inicializar aplicación
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
    // Actualizar título del documento
    document.title = translations.title;

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

    // Actualizar contenido dinámico (botones, indicadores, celdas de total, etc.)
    updateDynamicContent();

    // Recalcular totales para actualizar con el nuevo idioma
    calculateTotal('specific');
    calculateTotal('general');
}

function updateDynamicContent() {
    // Actualizar botones de eliminar
    document.querySelectorAll('.remove-row-btn').forEach(btn => {
        btn.textContent = translations.remove;
    });

    // Actualizar indicadores de solo lectura
    document.querySelectorAll('.readonly-indicator').forEach(indicator => {
        indicator.textContent = translations.readOnly;
    });

    // Actualizar todas las celdas de total con las traducciones actuales
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

// Inicializar la aplicación con traducciones
document.addEventListener('DOMContentLoaded', async function() {
    await loadTranslations(currentLanguage);

    // Configurar listener del selector de idioma
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    }

    // Mejorar comportamiento de inputs de fecha en móviles
    enhanceDateInputsForMobile();

    // Inicializar tablas
    initializeTable('specific', 1);
    syncSpecificToGeneral();
    toggleClearButtonVisibility('specific');
    toggleClearButtonVisibility('general');

    // Verificar si hay un cálculo para cargar desde sessionStorage
    loadCalculationFromSession();
    
    // Verificar si mostrar el botón de cálculos guardados
    toggleViewSavedButton();
});

function loadCalculationFromSession() {
    const calculationData = sessionStorage.getItem('loadCalculation');
    if (calculationData) {
        const calculation = JSON.parse(calculationData);

        // Limpiar sessionStorage
        sessionStorage.removeItem('loadCalculation');

        // Guardar datos para edición futura
        sessionStorage.setItem('editingCalculation', JSON.stringify(calculation));

        // Mostrar indicador de edición
        showEditingIndicator(calculation);

        // Cargar datos basados en campos disponibles
        if (calculation.rows && calculation.rows.length > 0) {
            // Nuevo formato: cargar todas las filas en la tabla general en orden cronológico
            const specificTbody = document.getElementById('specific-tbody');
            const generalTbody = document.getElementById('general-tbody');

            // Limpiar todas las filas
            specificTbody.innerHTML = '';
            generalTbody.innerHTML = '';

            // Separar filas específicas y generales
            const specificRows = calculation.rows.filter(row => row.type === 'specific');
            const generalRows = calculation.rows.filter(row => row.type === 'general');

            // Agregar filas específicas a la tabla específica
            specificRows.forEach(rowData => {
                addTableRow('specific', specificTbody, false, rowData.startDate, rowData.endDate);
            });

            // Agregar todas las filas a la tabla general en orden cronológico
            calculation.rows.forEach(rowData => {
                const isReadonly = rowData.type === 'specific';
                addTableRow('general', generalTbody, isReadonly, rowData.startDate, rowData.endDate);
            });

            // Asegurar que haya al menos una fila editable vacía en general si no hay filas generales
            const editableRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
            if (editableRows.length === 0) {
                addTableRow('general', generalTbody, false);
            }
        } else {
            // Formato legacy: cargar específica y general por separado
            // Cargar datos específicos
            if (calculation.specificData && calculation.specificData.length > 0) {
                // Limpiar filas existentes
                const specificTbody = document.getElementById('specific-tbody');
                specificTbody.innerHTML = '';

                // Agregar filas con datos
                calculation.specificData.forEach(data => {
                    const row = addTableRow('specific', specificTbody, false, data.startDate, data.endDate);
                });
            }

            // Cargar datos generales (solo filas editables)
            const generalTbody = document.getElementById('general-tbody');
            generalTbody.innerHTML = ''; // Limpiar todas las filas

            if (calculation.generalData && calculation.generalData.length > 0) {
                // Agregar filas editables con datos
                calculation.generalData.forEach(data => {
                    addTableRow('general', generalTbody, false, data.startDate, data.endDate);
                });
            } else {
                // Agregar al menos una fila editable vacía
                addTableRow('general', generalTbody, false);
            }
        }

        // Recalcular totales
        calculateTotal('specific');
        calculateTotal('general');

        // Cambiar idioma si es necesario
        if (calculation.language && calculation.language !== currentLanguage) {
            changeLanguage(calculation.language);
        }

        // Mostrar mensaje de éxito
        Swal.fire(
            translations.loadCalculation || 'Cálculo Cargado',
            `${translations.loadCalculation || 'Cálculo de'} ${calculation.firstName} ${calculation.lastName} ${'cargado correctamente' || 'loaded successfully'}`,
            'success'
        );
    } else {
        // No hay cálculo para cargar, limpiar editingCalculation si existe
        sessionStorage.removeItem('editingCalculation');
        hideEditingIndicator();
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
    // Asignar timestamp para mantener orden cronológico
    row.dataset.timestamp = Date.now();
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
        // Para general, añadir la fila editable al final
        addTableRow('general', tbody, false);
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

    // Obtener las fechas de las filas específicas actuales
    const specificDates = [];
    const specificRows = specificTbody.querySelectorAll('tr');
    specificRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        if (startDate && endDate) {
            specificDates.push({ startDate, endDate });
        }
    });

    // Obtener las filas de solo lectura existentes y sus fechas
    const readonlyRows = generalTbody.querySelectorAll('.readonly-row');
    const existingReadonlyDates = [];
    readonlyRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        existingReadonlyDates.push({ startDate, endDate, row });
    });

    // Eliminar filas de solo lectura que ya no existen en específica
    existingReadonlyDates.forEach(({ startDate, endDate, row }) => {
        const stillExists = specificDates.some(specific =>
            specific.startDate === startDate && specific.endDate === endDate
        );
        if (!stillExists) {
            row.remove();
        }
    });

    // Agregar filas de solo lectura que existen en específica pero no en general
    specificDates.forEach(({ startDate, endDate }) => {
        const alreadyExists = existingReadonlyDates.some(existing =>
            existing.startDate === startDate && existing.endDate === endDate
        );
        if (!alreadyExists) {
            addTableRow('general', generalTbody, true, startDate, endDate);
        }
    });

    // Gestionar filas editables - NO eliminar filas editables existentes, permitir múltiples
    const editableRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
    if (editableRows.length === 0) {
        // Si no hay filas editables, añadir una
        addTableRow('general', generalTbody, false);
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

    // Si es tabla específica, sincronizar con general (solo si no estamos editando)
    if (tableType === 'specific') {
        const isEditing = sessionStorage.getItem('editingCalculation');
        if (!isEditing) {
            syncSpecificToGeneral();
        }
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

    // Recopilar todas las filas en orden cronológico basado en timestamps
    const allRows = [];
    const generalRows = document.querySelectorAll('#general-tbody tr:not(.readonly-row)');
    const specificRows = document.querySelectorAll('#specific-tbody tr');

    // Crear un array con todas las filas con sus timestamps
    const rowsWithTimestamps = [];

    generalRows.forEach((row) => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        if (startDate && endDate) {
            rowsWithTimestamps.push({
                type: 'general',
                startDate: startDate,
                endDate: endDate,
                timestamp: parseInt(row.dataset.timestamp) || Date.now()
            });
        }
    });

    specificRows.forEach((row) => {
        const dateInputs = row.querySelectorAll('.date-input');
        const startDate = dateInputs[0].value;
        const endDate = dateInputs[1].value;
        if (startDate && endDate) {
            rowsWithTimestamps.push({
                type: 'specific',
                startDate: startDate,
                endDate: endDate,
                timestamp: parseInt(row.dataset.timestamp) || Date.now()
            });
        }
    });

    // Ordenar por timestamp
    rowsWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);

    // Para compatibilidad, mantener specificData y generalData
    const specificData = rowsWithTimestamps.filter(row => row.type === 'specific').map(row => ({
        startDate: row.startDate,
        endDate: row.endDate
    }));

    const generalData = rowsWithTimestamps.filter(row => row.type === 'general').map(row => ({
        startDate: row.startDate,
        endDate: row.endDate
    }));

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

    // Mostrar SweetAlert para ingresar datos
    const isEditing = !!existingData;
    
    Swal.fire({
        title: isEditing ? translations.updateCalculation : translations.saveDialogTitle,
        html: `
            <div style="text-align: left;">
                ${isEditing ? `<p style="margin-bottom: 15px; color: #856404; background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeaa7;">${translations.editingMode} ${existingData.firstName} ${existingData.lastName}</p>` : ''}
                <label for="registroNumber" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.registroNumber}:</label>
                <input id="registroNumber" type="number" class="swal2-input" placeholder="${translations.registroNumber}" value="${isEditing ? existingData.registroNumber : ''}" style="width: 100%; margin-bottom: 15px;">
                
                <label for="firstName" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.firstName}:</label>
                <input id="firstName" class="swal2-input" placeholder="${translations.firstName}" value="${isEditing ? existingData.firstName : ''}" style="width: 100%; margin-bottom: 15px;">
                
                <label for="lastName" style="display: block; margin-bottom: 5px; font-weight: 600;">${translations.lastName}:</label>
                <input id="lastName" class="swal2-input" placeholder="${translations.lastName}" value="${isEditing ? existingData.lastName : ''}" style="width: 100%;">
                
                ${isEditing ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <p style="margin-bottom: 10px; font-weight: 600;">¿Qué desea hacer?</p>
                    <div style="display: flex; gap: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="saveAction" value="update" checked style="margin-right: 5px;">
                            ${translations.updateExisting}
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="saveAction" value="new" style="margin-right: 5px;">
                            ${translations.saveAsNew}
                        </label>
                    </div>
                </div>` : ''}
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: isEditing ? translations.updateCalculation : translations.confirmButton.replace('{action}', translations.saveCalculation.toLowerCase()),
        cancelButtonText: translations.cancelButton,
        customClass: {
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        preConfirm: () => {
            const registroNumber = document.getElementById('registroNumber').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            
            // Validar que el número de registro sea un número positivo válido
            const registroNum = parseInt(registroNumber);
            if (!registroNumber || isNaN(registroNum) || registroNum <= 0) {
                Swal.showValidationMessage(translations.saveErrorText);
                return false;
            }
            
            if (!firstName || !lastName) {
                Swal.showValidationMessage(translations.saveErrorText);
                return false;
            }
            
            const saveAction = isEditing ? document.querySelector('input[name="saveAction"]:checked').value : 'new';
            
            return { registroNumber: registroNum.toString(), firstName, lastName, saveAction };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { registroNumber, firstName, lastName, saveAction } = result.value;
            
            if (isEditing && saveAction === 'new') {
                // Guardar como nuevo cálculo
                const newCalculation = {
                    id: Date.now(),
                    registroNumber: registroNumber,
                    firstName: firstName,
                    lastName: lastName,
                    specificData: specificData,
                    generalData: generalData,
                    rows: rowsWithTimestamps, // Guardar orden cronológico
                    totalSpecific: totalSpecific,
                    totalGeneral: totalGeneral,
                    savedDate: new Date().toISOString(),
                    language: currentLanguage
                };
                
                // Guardar en localStorage
                const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
                savedCalculations.push(newCalculation);
                localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
                
                // Limpiar editingCalculation
                sessionStorage.removeItem('editingCalculation');
                hideEditingIndicator();
                
                // Mostrar mensaje de éxito
                Swal.fire(
                    translations.saveSuccessTitle,
                    translations.saveSuccessText,
                    'success'
                ).then(() => {
                    // Limpiar todos los campos después de guardar
                    clearAllFields();
                    // Verificar si mostrar el botón de cálculos guardados
                    toggleViewSavedButton();
                    // Redirigir al index después de un breve delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                });
            } else {
                // Actualizar cálculo existente (o guardar nuevo si no estaba editando)
                const calculation = isEditing ? {
                    ...existingData,
                    registroNumber: registroNumber,
                    firstName: firstName,
                    lastName: lastName,
                    specificData: specificData,
                    generalData: generalData,
                    rows: rowsWithTimestamps, // Guardar orden cronológico
                    totalSpecific: totalSpecific,
                    totalGeneral: totalGeneral,
                    savedDate: new Date().toISOString(),
                    language: currentLanguage
                } : {
                    id: Date.now(),
                    registroNumber: registroNumber,
                    firstName: firstName,
                    lastName: lastName,
                    specificData: specificData,
                    generalData: generalData,
                    rows: rowsWithTimestamps, // Guardar orden cronológico
                    totalSpecific: totalSpecific,
                    totalGeneral: totalGeneral,
                    savedDate: new Date().toISOString(),
                    language: currentLanguage
                };
                
                if (isEditing) {
                    // Actualizar en localStorage
                    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
                    const index = savedCalculations.findIndex(calc => calc.id === existingData.id);
                    if (index !== -1) {
                        savedCalculations[index] = calculation;
                        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
                    }
                    
                    // Limpiar editingCalculation
                    sessionStorage.removeItem('editingCalculation');
                    hideEditingIndicator();
                } else {
                    // Guardar nuevo
                    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
                    savedCalculations.push(calculation);
                    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
                }
                
                // Mostrar mensaje de éxito
                Swal.fire(
                    translations.saveSuccessTitle,
                    translations.saveSuccessText,
                    'success'
                ).then(() => {
                    // Limpiar todos los campos después de guardar
                    clearAllFields();
                    // Verificar si mostrar el botón de cálculos guardados
                    toggleViewSavedButton();
                    // Redirigir al index después de un breve delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                });
            }
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

function showEditingIndicator(calculation) {
    const indicator = document.getElementById('editing-indicator');
    const info = document.getElementById('editing-info');
    info.textContent = `${calculation.firstName} ${calculation.lastName} (${calculation.registroNumber})`;
    indicator.style.display = 'block';
}

function hideEditingIndicator() {
    const indicator = document.getElementById('editing-indicator');
    indicator.style.display = 'none';
}

function cancelEdit() {
    Swal.fire({
        title: translations.confirmClearTitle,
        text: translations.confirmClearText.replace('{tableName}', translations.newCalculation.toLowerCase()),
        icon: 'question',
        showCancelButton: true,
        customClass: {
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        confirmButtonText: translations.confirmButton.replace('{action}', translations.cancelEdit.toLowerCase()),
        cancelButtonText: translations.cancelButton
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar editingCalculation
            sessionStorage.removeItem('editingCalculation');
            hideEditingIndicator();
            
            // Limpiar todos los campos
            clearAllFields();
            
            // Reinicializar tablas
            initializeTable('specific', 1);
            const generalTbody = document.getElementById('general-tbody');
            generalTbody.innerHTML = '';
            addTableRow('general', generalTbody, false);
            
            // Recalcular totales
            calculateTotal('specific');
            calculateTotal('general');
            
            Swal.fire(
                translations.clearedTitle,
                translations.clearedText,
                'success'
            );
        }
    });
}

// Función para mostrar/ocultar el botón de cálculos guardados
function toggleViewSavedButton() {
    const viewSavedBtn = document.querySelector('.view-saved-btn');
    if (!viewSavedBtn) return;
    
    // Verificar si hay cálculos guardados en localStorage
    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    const hasSavedCalculations = savedCalculations.length > 0;
    
    // Mostrar u ocultar el botón según si hay cálculos guardados
    viewSavedBtn.style.display = hasSavedCalculations ? 'inline-block' : 'none';
}

// Función para mejorar el comportamiento de inputs de fecha en móviles
function enhanceDateInputsForMobile() {
    // Detectar si es un dispositivo móvil/táctil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (window.innerWidth <= 768 && window.innerHeight <= 1024);

    if (isMobile) {
        // Para dispositivos móviles, agregar event listeners para mejorar UX
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('date-input')) {
                const input = e.target;
                
                // Asegurar que el input mantenga el foco después de seleccionar fecha
                setTimeout(() => {
                    if (input.value && !input.matches(':focus')) {
                        input.focus();
                    }
                }, 100);
            }
        });

        // Mejorar el comportamiento al hacer click en inputs de fecha
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('date-input')) {
                const input = e.target;
                
                // En algunos navegadores móviles, forzar que el calendario se abra
                if (!input.value) {
                    // Si está vacío, intentar abrir el calendario
                    input.showPicker && input.showPicker();
                }
            }
        });

        // Manejar el evento blur para asegurar que los valores se mantengan
        document.addEventListener('blur', function(e) {
            if (e.target.classList.contains('date-input')) {
                const input = e.target;
                
                // Validar formato de fecha en móviles
                if (input.value) {
                    const date = new Date(input.value);
                    if (isNaN(date.getTime())) {
                        // Si la fecha no es válida, intentar corregirla
                        input.value = '';
                    }
                }
            }
        }, true);
    }
}

// Función para limpiar todos los campos y resetear las tablas
function clearAllFields() {
    // Limpiar tabla específica
    const specificTbody = document.getElementById('specific-tbody');
    const specificRows = specificTbody.querySelectorAll('tr');
    specificRows.forEach(row => {
        if (!row.classList.contains('readonly-row')) {
            const dateInputs = row.querySelectorAll('.date-input');
            dateInputs.forEach(input => input.value = '');
        }
    });
    
    // Limpiar tabla general (solo filas editables)
    const generalTbody = document.getElementById('general-tbody');
    const generalRows = generalTbody.querySelectorAll('tr:not(.readonly-row)');
    generalRows.forEach(row => {
        const dateInputs = row.querySelectorAll('.date-input');
        dateInputs.forEach(input => input.value = '');
    });
    
    // Recalcular totales
    calculateTotal('specific');
    calculateTotal('general');
    
    // Actualizar visibilidad de botones de limpiar
    toggleClearButtonVisibility('specific');
    toggleClearButtonVisibility('general');
}