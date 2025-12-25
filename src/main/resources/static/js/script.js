document.addEventListener('DOMContentLoaded', function() {
                                // Обработка блока "ИНФОРМАЦИЯ" в ЗАПРОСЕ КП 
    // Элементы формы
    const numberInput = document.getElementById('number');
    const dateInput = document.getElementById('date');
    const managerSelect = document.getElementById('manager');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

                                    // Базовый URL бэкенда (заменить на актуальный)
    const API_BASE_URL = 'http://localhost:8080/api';

                                                             // Функция для загрузки номера документа
    async function loadDocumentNumber() {
        try {
            const response = await fetch(`${API_BASE_URL}/document/next-number`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            numberInput.value = data.number || 'Не удалось получить номер';
        } catch (error) {
            console.error('Ошибка загрузки номера:', error);
            numberInput.value = 'Ошибка загрузки';
        }
    }

                                                         // Функция для загрузки текущей даты
    async function loadCurrentDate() {
        try {
            const response = await fetch(`${API_BASE_URL}/system/current-date`, {
                method: 'GET',
                headers: {
            'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            dateInput.value = data.date || new Date().toLocaleDateString('ru-RU');
        } catch (error) {
            console.error('Ошибка загрузки даты:', error);
            dateInput.value = new Date().toLocaleDateString('ru-RU');
        }
    }

                                                         // Функция для загрузки списка менеджеров
    async function loadManagers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/managers`, {
                method: 'GET',
                headers: {
            'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const managers = await response.json();

            // Очищаем существующие опции
            managerSelect.innerHTML = '';

            // Добавляем опцию «Выберите менеджера»
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Выберите менеджера';
            managerSelect.appendChild(defaultOption);

            // Заполняем список менеджеров
            managers.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager.id;
                option.textContent = manager.name;
                managerSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки менеджеров:', error);
            managerSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

    // Инициализация всех полей при загрузке страницы
    async function initializeFormFields() {
        await loadDocumentNumber();
        await loadCurrentDate();
        await loadManagers();
    }

    // Запускаем инициализацию
    initializeFormFields();
    
    
                                                //Обработка кнопки Добавить в таблице для добавления новой строки
    
    // Элементы таблицы и кнопки
    const selectAllCheckbox = document.getElementById('selectAll');
    const addRowBtn = document.getElementById('addRowBtn');
    const tbody = document.getElementById('itemsTbody');
    const deleteRowBtn = document.getElementById('deleteRowBtn');

    // Обработчик для главного чекбокса (Выбрать все)
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;

        // Получаем ВСЕ чекбоксы строк (включая динамически добавленные)
        const allRowCheckboxes = document.querySelectorAll('#itemsTable tbody .row-checkbox');

        allRowCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });

        // Обновляем состояние главного чекбокса
        updateSelectAllState();
    });

    // Функция для обновления состояния главного чекбокса
    function updateSelectAllState() {
        const rowCheckboxes = Array.from(
            document.querySelectorAll('#itemsTable tbody .row-checkbox')
        );

        if (rowCheckboxes.length === 0) return;

        const allChecked = rowCheckboxes.every(checkbox => checkbox.checked);
        const anyChecked = rowCheckboxes.some(checkbox => checkbox.checked);

        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && anyChecked;
    }

    // Функция для добавления обработчика к новому чекбоксу
    function addCheckboxHandler(checkbox) {
        checkbox.addEventListener('change', updateSelectAllState);
    }

    // Добавляем обработчики для существующих чекбоксов
    document.querySelectorAll('#itemsTable tbody .row-checkbox').forEach(addCheckboxHandler);

    // Инициализируем состояние главного чекбокса при загрузке
    updateSelectAllState();

    // Обработчик клика по кнопке «Добавить строку»
    addRowBtn.addEventListener('click', function() {
        // Создаём новую строку
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';

        // Добавляем первую ячейку с чекбоксом
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkboxCell.appendChild(checkbox);
        newRow.appendChild(checkboxCell);

        // Массив заголовков столбцов (для атрибута placeholder)
        const columnPlaceholders = [
            'Артикул',
            'Код ТНВЭД',
            'Наименование как в инвойсе',
            'Наименование на русском',
            'Вес',
            'Количество общее',
            'Единица измерения',
            'НДС',
            'Пошлина',
            'Стоимость за шт',
            'Стоимость Итого'
        ];

        // Создаём ячейки и входные поля
        columnPlaceholders.forEach(placeholder => {
            const cell = document.createElement('td');
            const input = document.createElement('input');

            input.type = 'text';
            input.className = 'input-text';
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
        newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
                                                // ОБРАБОТКА КНОПКИ УДАЛИТЬ

    // Обработчик клика по кнопке «Удалить строку»
    deleteRowBtn.addEventListener('click', function() {
        // Получаем все строки таблицы
        const rows = Array.from(tbody.querySelectorAll('.item-row'));
        // Фильтруем строки, где чекбокс отмечен
        const checkedRows = rows.filter(row => {
            const checkbox = row.querySelector('.row-checkbox');
            return checkbox && checkbox.checked;
        });

        // Если нет отмеченных строк, выводим сообщение
        if (checkedRows.length === 0) {
            alert('Пожалуйста, выберите строки для удаления');
            return;
        }

        // Удаляем отмеченные строки
        checkedRows.forEach(row => {
            tbody.removeChild(row);
        });

        // Обновляем состояние главного чекбокса после удаления
        updateSelectAllState();
    });


                    // REGISTRATION

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Очищаем предыдущее сообщение об ошибке
        errorMessage.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Отправка данных на сервер Spring Boot
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
            password: password
                })
            });

            if (response.ok) {
                // Успешная аутентификация — перенаправление на главную страницу
                window.location.href = 'index.html';
            } else {
                // Ошибка аутентификации
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Неверные учётные данные';
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            errorMessage.textContent = 'Произошла ошибка при подключении к серверу';
        }
    });
 });

