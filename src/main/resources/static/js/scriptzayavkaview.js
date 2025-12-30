document.addEventListener('DOMContentLoaded', function() {
    // 1. Получаем documentNumber из URL
    const urlParams = new URLSearchParams(window.location.search);
    const documentNumber = urlParams.get('documentNumber');
    const managerSelect = document.getElementById('manager');
    const selectAllCheckbox = document.getElementById("selectAll");
    const addRowBtn = document.getElementById("addRowBtn");
    const tbody = document.getElementById("itemsTbody");
    const deleteRowBtn = document.getElementById("deleteRowBtn");
    const loadFromFileBtn = document.getElementById('loadFromFileBtn');

    if (!documentNumber) {
        alert('Не указан номер документа!');
        return;
    }

    // Отображаем номер в заголовке
    document.getElementById('docNumberDisplay').textContent = documentNumber;

    function loadActiveOrders() {
        fetch('/api/orders/active')
            .then(response => response.json())
            .then(data => {
                console.log('Полученные заказы:', data);
                populateOrdersTable(data);
            })
            .catch(error => console.error('Ошибка загрузки заказов:', error));
    }

    function populateOrdersTable(orders) {
        const tbody = document.getElementById('itemsTbody');
        tbody.innerHTML = ''; // Очищаем таблицу

        orders.forEach(order => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${order.documentNumber}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${order.manager}</td>
                <td>${order.status}</td>
            `;

            tbody.appendChild(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
    }

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
                fetch(`/api/orders/header/${documentNumber}`),          // ← Новый URL
                fetch(`/api/orders/items/${documentNumber}`)           // ← Новый URL
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

     //  ЧЕК БОКС
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener("change", function () {
                const isChecked = this.checked;
                const allRowCheckboxes = document.querySelectorAll("#itemsTable tbody .row-checkbox");

                allRowCheckboxes.forEach((checkbox) => {
                    checkbox.checked = isChecked;
                });

                updateSelectAllState();
            });
        } else {
            console.warn('Элемент #selectAll не найден. Проверьте HTML.');
        }

            // Функция для обновления состояния главного чекбокса
            function updateSelectAllState() {
                const rowCheckboxes = Array.from(document.querySelectorAll("#itemsTable tbody .row-checkbox"));

                if (rowCheckboxes.length === 0) return;

                const allChecked = rowCheckboxes.every((checkbox) => checkbox.checked);
                const anyChecked = rowCheckboxes.some((checkbox) => checkbox.checked);

                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = !allChecked && anyChecked;
            }

            // Функция для добавления обработчика к новому чекбоксу
            function addCheckboxHandler(checkbox) {
                checkbox.addEventListener("change", updateSelectAllState);
            }

            // Добавляем обработчики для существующих чекбоксов
            document.querySelectorAll("#itemsTable tbody .row-checkbox").forEach(addCheckboxHandler);

            // Инициализируем состояние главного чекбокса при загрузке
            updateSelectAllState();

            // Обработчик клика по кнопке «Добавить строку»
            addRowBtn.addEventListener("click", function () {
                // Создаём новую строку
                const newRow = document.createElement("tr");
                newRow.className = "item-row";

                // Добавляем первую ячейку с чекбоксом
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "row-checkbox";
                checkboxCell.appendChild(checkbox);
                newRow.appendChild(checkboxCell);

                // Массив заголовков столбцов (для атрибута placeholder)
                const columnPlaceholders = [
                    "Артикул",
                    "Код ТНВЭД",
                    "Наименование как в инвойсе",
                    "Наименование на русском",
                    "Вес",
                    "Количество общее",
                    "Единица измерения",
                    "НДС",
                    "Пошлина",
                    "Стоимость за шт",
                    "Стоимость Итого"
                ];

                // Создаём ячейки и входные поля
                columnPlaceholders.forEach((placeholder) => {
                    const cell = document.createElement("td");
                    const input = document.createElement("input");

                    input.type = "text";
                    input.className = "input-text";
                    input.placeholder = placeholder;

                    cell.appendChild(input);
                    newRow.appendChild(cell);
                });

                // Добавляем новую строку в конец таблицы
                tbody.appendChild(newRow);

                // Добавляем обработчик события для нового чекбокса
                addCheckboxHandler(checkbox);

                // Обновляем состояние главного чекбокса после добавления новой строки
                updateSelectAllState();

                // Плавно прокручиваем к новой строке (опционально)
                newRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });

            // ОБРАБОТКА КНОПКИ УДАЛИТЬ

            // Обработчик клика по кнопке «Удалить строку»
            deleteRowBtn.addEventListener("click", function () {
                // Получаем все строки таблицы
                const rows = Array.from(tbody.querySelectorAll(".item-row"));
                // Фильтруем строки, где чекбокс отмечен
                const checkedRows = rows.filter((row) => {
                    const checkbox = row.querySelector(".row-checkbox");
                    return checkbox && checkbox.checked;
                });

                // Если нет отмеченных строк, выводим сообщение
                if (checkedRows.length === 0) {
                    alert("Пожалуйста, выберите строки для удаления");
                    return;
                }

                // Удаляем отмеченные строки
                checkedRows.forEach((row) => {
                    tbody.removeChild(row);
                });

                // Обновляем состояние главного чекбокса после удаления
                updateSelectAllState();
            });



            // ЗАГРУЗКА ИЗ ФАЙЛА                                                                                    /* МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ КП ИЗ ФАЙЛА*/

        function createModal() {
            // Оверлей (полностью покрывает экран)
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            // Модальное окно (строго по центру)
            const modal = document.createElement('div');
            modal.className = 'modal-window';

            modal.innerHTML = `
                <span class="modal-close">&times;</span>
                <h3 class="modal-title">Загрузить файл с запросом КП</h3>
                <form class="file-upload-form">
                    <input type="file" id="fileInput" accept=".xlsx,.xls,.csv,.docx,.pdf" required>
                    <p>Выберите файл с вашего компьютера</p>
                    <div class="file-info" id="fileNameDisplay"></div>
                    <button type="submit" class="btn-upload">Загрузить</button>
                </form>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            return { overlay, modal };
        }

        function closeModal() {
            const overlay = document.querySelector('.modal-overlay');
            const modal = document.querySelector('.modal-window');

            if (overlay) overlay.remove();
            if (modal) modal.remove();
        }

        if (loadFromFileBtn) {
            loadFromFileBtn.addEventListener('click', function() {
                const { overlay, modal } = createModal();

                // Закрытие по крестику
                modal.querySelector('.modal-close').addEventListener('click', closeModal);

                // Закрытие при клике на оверлей (но не на само окно)
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) closeModal();
                });

                // Отображение имени файла
                const fileInput = document.getElementById('fileInput');
                const fileNameDisplay = document.getElementById('fileNameDisplay');

                fileInput.addEventListener('change', function() {
                    const file = this.files[0];
                    fileNameDisplay.textContent = file ? `Выбран файл: ${file.name}` : '';
                });

                // Отправка формы
                modal.querySelector('form').addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const file = fileInput.files[0];
                    if (!file) {
                        alert('Пожалуйста, выберите файл!');
                        return;
                    }

                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        // 1. Отправляем файл на парсинг (без сохранения!)
                        const response = await fetch('/api/parse-excel', {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Ошибка загрузки файла');
                        }

                        const data = await response.json();

                        // 2. Очищаем таблицу
                        tbody.innerHTML = '';

                        // 3. Заполняем таблицу данными
                        data.nomenclatures.forEach(nomenclature => {
                            const newRow = document.createElement('tr');
                            newRow.className = 'item-row';

                            // Чекбокс
                            const checkboxCell = document.createElement('td');
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.className = 'row-checkbox';
                            checkboxCell.appendChild(checkbox);
                            newRow.appendChild(checkboxCell);

                            // Ячейки с данными
                            const expectedFields = [
                                'article', 'tnvedCode', 'invoiceName', 'russianName',
                                'weight', 'quantity', 'unit', 'vat', 'duty',
                                'pricePerUnit', 'totalPrice'
                            ];

                            expectedFields.forEach(field => {
                                const cell = document.createElement('td');
                                const input = document.createElement('input');
                                input.type = 'text';
                                input.className = 'input-text';
                                input.value = nomenclature[field] || '';
                                cell.appendChild(input);
                                newRow.appendChild(cell);
                            });

                            tbody.appendChild(newRow);
                            addCheckboxHandler(checkbox);
                        });


                        updateSelectAllState();
                        alert('Данные загружены и отображены!');
                        closeModal();

                    } catch (error) {
                        console.error('Ошибка при загрузке файла:', error);
                        alert('Произошла ошибка: ' + error.message);
                    }
                });
            });
        } else {
            console.warn('Кнопка #loadFromFileBtn не найдена. Проверьте HTML.');
        }


        // Закрытие по Esc
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.querySelector('.modal-overlay')) {
                closeModal();
            }
        });



                                // ОБРАБОТКА СОХРАНЕНИЯ ЗАЯВКИ

    document.getElementById('saveOrder').addEventListener('click', async function() {
        try {
            // 1. Получаем значение даты из поля формы
            const dateInputValue = document.getElementById('date').value;

            if (!dateInputValue) {
                alert('Укажите дату!');
                return;
            }

            // 2. Формируем createdAt в формате ISO 8601
            // Вариант 1: Начало дня (как в вашем примере)
            const createdAt = dateInputValue + "T00:00:00";

            // Вариант 2: Текущее время (как new Date().toISOString())
            // const createdAt = new Date(dateInputValue).toISOString();

            // 3. Собираем данные формы
            const documentData = {
                documentNumber: document.getElementById('number').value,
                createdAt: createdAt,                    // ← Теперь переменная определена
                status: document.getElementById('status').value,
                manager: document.getElementById('manager').value,
                // Добавьте остальные поля из формы по аналогии
            };

            // 4. Собираем номенклатуру из таблицы
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

            // 5. Отправляем на сервер
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
    loadActiveOrders();
});
