document.addEventListener('DOMContentLoaded', function() {
    const numberInput = document.getElementById('number');
    const dateInput = document.getElementById('date');
    const managerSelect = document.getElementById('manager');
    const statusSelect = document.getElementById('status');
    const selectAllCheckbox = document.getElementById("selectAll");
    const addRowBtn = document.getElementById("addRowBtn");
    const tbody = document.getElementById("itemsTbody");
    const deleteRowBtn = document.getElementById("deleteRowBtn");

    const loadFromFileBtn = document.getElementById('loadFromFileBtn');


    if (!numberInput) {
        console.error('Элемент #number не найден!');
        return;
    }
    if (!dateInput) {
        console.error('Элемент #date не найден!');
        return;
    }
    if (!managerSelect) {
        console.error('Элемент #manager не найден!');
        return;
    }
    if (!statusSelect) {
        console.error('Элемент #status не найден!');
        return;
    }

    const API = {
        NEXT_NUMBER: '/api/documents/next-number',
        SAVE: '/api/documents/save'
    };

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    dateInput.value = formatDate(new Date());

    let documentNumber = null;      // ← Номер документа (получаем один раз)
    let selectedManager = null;     // ← ФИО менеджера (только после выбора)
    let selectedStatus = null;        // ← Status zaprosa (только после выбора)

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

    // 2. Получаем номер документа (один раз при загрузке)
    async function fetchDocumentNumber() {
        try {
            const response = await fetch(API.NEXT_NUMBER);
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }

            const data = await response.json();
            if (!data.documentNumber) {
                throw new Error('Сервер не вернул номер');
            }

            documentNumber = data.documentNumber;
            numberInput.value = documentNumber;
            console.log('Номер документа получен:', documentNumber);


        } catch (error) {
            console.error('Ошибка получения номера:', error.message);
            alert('Не удалось получить номер документа: ' + error.message);
        }
    }

    statusSelect.addEventListener('change', function() {
        selectedStatus = this.value;
        console.log('Статус выбран:', selectedStatus);
    });
    // 3. Сохраняем документ (только если есть номер И менеджер И статус)
    async function saveDocument() {
        // Проверяем, что номер и менеджер есть
        if (!documentNumber) {
            alert('Номер документа не получен!');
            return;
        }
        if (!selectedManager) {
            alert('Пожалуйста, выберите менеджера!');
            return;
        }
        if (!selectedStatus) {
                    alert('Пожалуйста, выберите статус!');
                    return;
                }

        try {
            const saveResponse = await fetch(API.SAVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    documentNumber: documentNumber,
                    createdAt: dateInput.value,
                    manager: selectedManager,  // ← Отправляем ФИО менеджера
                    status: selectedStatus
                })
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || `HTTP ошибка: ${saveResponse.status}`);
            }

            console.log('Документ сохранён:', {
                number: documentNumber,
                date: dateInput.value,
                manager: selectedManager,
                status: selectedStatus
            });
            alert('Документ успешно сохранён!');


        } catch (error) {
            console.error('Ошибка сохранения:', error.message);
            alert('Произошла ошибка: ' + error.message);
        }
    }

    // Запускаем загрузку менеджеров и получение номера при старте
    loadManagers();
    fetchDocumentNumber();

    // Кнопка для сохранения
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDocument);
    } else {
        console.warn('Кнопка сохранения (#saveBtn) не найдена. Добавьте её в HTML.');
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
                    data.items.forEach(item => {
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
                            input.value = item[field] || '';
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
});
