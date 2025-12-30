document.addEventListener('DOMContentLoaded', function() {
    // Получение элементов
    const numberInput = document.getElementById('number');
    const dateInput = document.getElementById('date');
    const managerSelect = document.getElementById('manager');
    const statusSelect = document.getElementById('status');
    const selectAllCheckbox = document.getElementById('selectAll');
    const addRowBtn = document.getElementById('addRowBtn');
    const deleteRowBtn = document.getElementById('deleteRowBtn');
    const tbody = document.getElementById('itemsTbody');
    const loadFromFileBtn = document.getElementById('loadFromFileBtn');



    // Проверка критических элементов
    if (!numberInput || !dateInput || !managerSelect || !statusSelect) {
        console.error('Критические элементы формы не найдены!');
        return;
    }

    // Параметры
    const urlParams = new URLSearchParams(window.location.search);
    const docNumberFromUrl = urlParams.get('documentNumber');
    let documentNumber = null; // Инициализируем как null


    const API = {
        NEXT_NUMBER: '/api/documents/next-number',
        SAVE: '/api/documents/save'
    };

    // Вспомогательные функции
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function loadManagers() {
        try {
            const response = await fetch('/api/users/managers');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const managers = await response.json();
            managerSelect.innerHTML = '<option value="">— Выберите менеджера —</option>';

            managers.forEach(manager => {
                const option = document.createElement('option');
                // Используем полное имя как value
                option.value = `${manager.username} ${manager.surname}`;
                option.textContent = `${manager.username} ${manager.surname}`;
                managerSelect.appendChild(option);
            });

            managerSelect.addEventListener('change', () => {
                console.log('Менеджер выбран:', managerSelect.value);
            });
        } catch (error) {
            console.error('Ошибка загрузки менеджеров:', error.message);
            managerSelect.innerHTML += '<option value="">Ошибка загрузки</option>';
        }
    }


    async function fetchDocumentNumber() {
        try {
            const response = await fetch(API.NEXT_NUMBER);
            if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);

            const data = await response.json();
            if (!data.documentNumber) throw new Error('Сервер не вернул номер');

            documentNumber = data.documentNumber;
            numberInput.value = documentNumber;
            console.log('Номер документа получен:', documentNumber);
        } catch (error) {
            console.error('Ошибка получения номера:', error.message);
            alert('Не удалось получить номер документа: ' + error.message);
        }
    }

    async function loadDocumentAndNomenclatures(docNum) {
          try {
                 const response = await fetch(`/api/documents/${docNum}/full`);
                 if (!response.ok) throw new Error('Документ не найден');

                 const data = await response.json();
                 const doc = data.document;

                numberInput.value = doc.documentNumber;
                dateInput.value = formatDate(new Date(doc.createdAt));

                // Заполняем текстовое поле менеджером
                managerSelect.value = doc.manager || '— Менеджер не указан —';

                statusSelect.value = doc.status;

                // Заполняем поле менеджера
                if (doc.manager) {
                    // Ищем существующую опцию
                    const option = managerSelect.querySelector(`option[value="${doc.manager}"]`);
                    if (option) {
                        managerSelect.value = doc.manager;
                    } else {
                        // Добавляем новую опцию, если менеджера нет в списке
                        const newOption = document.createElement('option');
                        newOption.value = doc.manager;
                        newOption.textContent = doc.manager;
                        managerSelect.appendChild(newOption);
                        managerSelect.value = doc.manager;
                    }
                } else {
                    managerSelect.value = ''; // или заглушка
                }


            tbody.innerHTML = '';

            data.nomenclatures.forEach(item => {
                const newRow = document.createElement('tr');
                newRow.className = 'item-row';

                // Чекбокс
                const checkboxCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'row-checkbox';
                checkboxCell.appendChild(checkbox);
                newRow.appendChild(checkboxCell);

                // Поля номенклатуры
                ['article', 'tnvedCode', 'invoiceName', 'russianName',
                 'weight', 'quantity', 'unit', 'vat', 'duty',
                 'pricePerUnit', 'totalPrice'].forEach(field => {
                    const cell = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'input-text';
                    input.value = item[field];
                    cell.appendChild(input);
                    newRow.appendChild(cell);
                });

                tbody.appendChild(newRow);
            });

            console.log('Данные загружены:', data);
        } catch (error) {
            console.error('Ошибка загрузки:', error.message);
            alert('Не удалось загрузить документ: ' + error.message);
        }
    }

    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll('#itemsTable tbody .row-checkbox');
        if (checkboxes.length === 0) return;

        const allChecked = [...checkboxes].every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && [...checkboxes].some(cb => cb.checked);
    }

    function addCheckboxHandler(checkbox) {
        checkbox.addEventListener('change', updateSelectAllState);
    }

    // Инициализация
    dateInput.value = formatDate(new Date());

    if (docNumberFromUrl) {
        loadManagers().then(() => loadDocumentAndNomenclatures(docNumberFromUrl));
    } else {
        alert('Номер документа не указан в URL! Используйте ?documentNumber=XXXXXX');
        loadManagers();
        fetchDocumentNumber();
    }

    // Обработчики событий
    statusSelect.addEventListener('change', () => {
        console.log('Статус выбран:', statusSelect.value);
    });

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            document.querySelectorAll('#itemsTable tbody .row-checkbox')
                .forEach(cb => cb.checked = this.checked);
            updateSelectAllState();
        });
    }



// Кнопка для сохранения
        document.getElementById('saveBtn').addEventListener('click', async function() {
            try {
                // 1. Получаем значение даты из поля формы
                const dateInputValue = document.getElementById('date').value;

                if (!dateInputValue) {
                    alert('Укажите дату!');
                    return;
                }

                // 2. Формируем createdAt в формате ISO 8601
                const createdAt = dateInputValue + "T00:00:00";

                // 3. Собираем данные формы
                const documentData = {
                    documentNumber: document.getElementById('number').value,
                    createdAt: createdAt,
                    status: document.getElementById('status').value,
                    manager: document.getElementById('manager').value
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

                // 5. Отправляем на сервер (с await!)
                const response = await fetch('/api/documents/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        documentNumber: documentData.documentNumber,
                        createdAt: documentData.createdAt,
                        manager: documentData.manager,
                        status: documentData.status,
                        nomenclatures: nomenclatures
                    })
                });

                // 6. Проверяем ответ
                if (response.ok) {
                    alert('Документ сохранён!');
                } else {
                    const errorText = await response.text(); // Можно попробовать получить текст ошибки
                    alert('Ошибка сохранения: ' + (errorText || response.statusText));
                }
            } catch (error) {
                console.error('Ошибка при сохранении:', error);
                alert('Произошла ошибка: ' + error.message);
            }
        });





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

                                        // СОЗДАНИЕ ЗАЯВКИ

        const createZayavkaBtn = document.getElementById('createZayavkaBtn');

        if (createZayavkaBtn) {
            createZayavkaBtn.addEventListener('click', function() {
                if (!documentNumber) {
                    alert('Номер документа не сформирован! Подождите загрузки...');
                    return;
                }

                // Переходим на страницу заявки с параметром documentNumber
                window.location.href = `zayavka.html?documentNumber=${documentNumber}`;
            });
        } else {
            console.warn('Кнопка #createZayavkaBtn не найдена. Проверьте HTML.');
        }

});
