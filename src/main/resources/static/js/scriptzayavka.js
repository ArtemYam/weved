document.addEventListener('DOMContentLoaded', function() {
    // 1. Получаем documentNumber из URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentNumber = urlParams.get('documentNumber');
    const managerSelect = document.getElementById('manager');

    if (!documentNumber) {
        alert('Не указан номер документа!');
        return;
    }

    // Отображаем номер в заголовке
    document.getElementById('docNumberDisplay').textContent = documentNumber;

    // 1. Загружаем менеджеров
    async function loadManagers() {
        try {
            const response = await fetch('/api/users/managers');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);


            const managers = await response.json();
            managerSelect.innerHTML = '<option value="">— Выберите менеджера —</option>';

            managers.forEach(manager => {
                const option = document.createElement('option');
                option.value = `${manager.username} ${manager.surname}`;
                option.textContent = `${manager.username} ${manager.surname}`;
                managerSelect.appendChild(option);
            });

            // Обработчик: срабатывает ТОЛЬКО при выборе менеджера
            managerSelect.addEventListener('change', function() {
                selectedManager = this.value;
                console.log('Менеджер выбран:', selectedManager);

            });

        } catch (error) {
            console.error('Ошибка загрузки менеджеров:', error.message);
            managerSelect.innerHTML += '<option value="">Ошибка загрузки</option>';
        }
    }

    // 2. Запрашиваем данные с бэкенда
    async function loadData() {
        try {
            // Запрос: документ + номенклатура
            const [docResponse, nomenResponse] = await Promise.all([
                fetch(`/api/documents/documents/${documentNumber}`),
                fetch(`/api/documents/nomenclatures/${documentNumber}`)
            ]);

            if (!docResponse.ok || !nomenResponse.ok) {
                throw new Error('Ошибка загрузки данных');
            }

            const documentData = await docResponse.json();
            const nomenclatures = await nomenResponse.json();

            // 3. Заполняем поля формы
            fillFormFields(documentData);
            fillNomenclatureTable(nomenclatures);

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Не удалось загрузить данные: ' + error.message);
        }
    }

    // 4. Заполняем поля формы
    function fillFormFields(data) {
        // Блок "Информация"
        document.getElementById('number').value = data.documentNumber || '';
        document.getElementById('date').value = formatDate(data.createdAt) || '';
        document.getElementById('status').value = data.status || '';
        document.getElementById('manager').value = data.manager || '';

        // Блок "Контракт"
        document.getElementById('trademark-contract').value = data.trademark || '';
        document.getElementById('contractType').value = data.contractType || '';
        document.getElementById('currency').value = data.currency || '';
        document.getElementById('contactName').value = data.contactName || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';


        // Блок "НАШ Контракт"
        document.getElementById('trademark').value = data.ourTrademark || '';
        document.getElementById('contractType-info-contract').value = data.ourContractType || '';
        document.getElementById('currency-info-contract').value = data.ourCurrency || '';
        document.getElementById('contactName-info-contract').value = data.ourContactName || '';
        document.getElementById('email-info-contract').value = data.ourEmail || '';
        document.getElementById('phone-info-contract').value = data.ourPhone || '';


        // Блок "Грузоотправитель"
        document.getElementById('shipper').value = data.shipper || '';
        document.getElementById('actualShipper').value = data.actualShipper || '';


        // Блок "Логистика"
        document.getElementById('shippingRate').value = data.shippingRate || '';
        document.getElementById('volumeM3').value = data.volumeM3 || '';
        document.getElementById('netWeight').value = data.netWeight || '';
        document.getElementById('grossWeight').value = data.grossWeight || '';
        document.getElementById('packagingType').value = data.packagingType || '';
        document.getElementById('transportType').value = data.transportType || '';
        document.getElementById('deliveryTerms').value = data.deliveryTerms || '';

        // Особые условия (пример)
        // document.getElementById('hazardClass').value = data.hazardClass || '';
        // document.getElementById('tempMode').value = data.tempMode || '';
        // document.getElementById('battery').value = data.battery || '';
        // document.getElementById('insurance').value = data.insurance || '';


        // Стоимость перевозки
        document.getElementById('shippingCurrency').value = data.shippingCurrency || '';
    }

    // 5. Заполняем таблицу номенклатуры
    function fillNomenclatureTable(items) {
        const tbody = document.getElementById('itemsTbody');
        tbody.innerHTML = ''; // Очищаем

        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'item-row';

            row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox"></td>
                <td><input type="text" class="input-text" value="${item.article || ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.tnvedCode || ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.invoiceName || ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.russianName || ''}" readonly></td>
                <td><input type="number" class="input-text" value="${item.weight != null ? item.weight : ''}" readonly></td>
                <td><input type="number" class="input-text" value="${item.quantity != null ? item.quantity : ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.unit || ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.vat || ''}" readonly></td>
                <td><input type="text" class="input-text" value="${item.duty || ''}" readonly></td>
                <td><input type="number" class="input-text" value="${item.pricePerUnit != null ? item.pricePerUnit : ''}" readonly></td>
                <td><input type="number" class="input-text" value="${item.totalPrice != null ? item.totalPrice : ''}" readonly></td>
            `;

            tbody.appendChild(row);
        });
    }

    // 6. Форматируем дату (YYYY-MM-DD)
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    }



                                // ОБРАБОТКА СОХРАНЕНИЯ ЗАЯВКИ

    document.getElementById('saveOrder').addEventListener('click', async function() {
        try {
            // Собираем данные формы
            const documentData = {
                documentNumber: document.getElementById('number').value,
                createdAt: document.getElementById('date').value,
                status: document.getElementById('status').value,
                manager: document.getElementById('manager').value,
                // Добавьте остальные поля из формы по аналогии
            };

            // Собираем номенклатуру из таблицы
            const nomenclatures = [];
            const rows = document.querySelectorAll('#itemsTbody .item-row');
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                nomenclatures.push({
                    article: inputs[1].value,
                    tnvedCode: inputs[2].value,
                    invoiceName: inputs[3].value,
                    russianName: inputs[4].value,
                    weight: parseFloat(inputs[5].value) || null,
                    quantity: parseInt(inputs[6].value) || null,
                    unit: inputs[7].value,
                    vat: inputs[8].value,
                    duty: inputs[9].value,
                    pricePerUnit: parseFloat(inputs[10].value) || null,
                    totalPrice: parseFloat(inputs[11].value) || null
                });
            });

            // Отправляем на сервер
            const response = await fetch('/api/orders/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    document: documentData,
                    nomenclatures: nomenclatures
                })
            });

            if (response.ok) {
                alert('Документ сохранён!');
            } else {
                alert('Ошибка сохранения: ' + response.statusText);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка: ' + error.message);
        }
    });




    // Запускаем загрузку
    loadData();
    loadManagers();
});
