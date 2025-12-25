document.addEventListener("DOMContentLoaded", function () {
    // Обработка блока "ИНФОРМАЦИЯ" в ЗАПРОСЕ КП
    // Элементы формы
    const numberInput = document.getElementById("saveBtn");
    const dateInput = document.getElementById("date");
    const managerSelect = document.getElementById("manager");

                                                        // Базовый URL бэкенда (замените на актуальный)
    const API_BASE_URL = "http://localhost:8080";




/**
 * Инициализация обработчика кнопки "Сохранить"
 */
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveBtn');
    const numberInput = document.getElementById('number');

    if (!saveButton || !numberInput) {
        console.error('Не найдены элементы DOM: кнопка или поле ввода номера');
        return;
    }

    saveButton.addEventListener('click', handleSaveClick);
});

/**
 * Обработчик клика по кнопке "Сохранить"
 */
async function handleSaveClick() {
    try {
        const response = await fetch('http://localhost:8080/zaproskp/next-number', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }

        const data = await response.json();

        // Проверяем наличие поля number в ответе
        if (data && data.number) {
            document.getElementById('number').value = data.number;
            showSuccessMessage(`Номер сохранён: ${data.number}`);
        } else {
            throw new Error('Неверный формат ответа от сервера');
        }

    } catch (error) {
        showErrorMessage(`Ошибка: ${error.message}`);
    }
}

/**
 * Показывает сообщение об успешном выполнении
 * @param {string} message - текст сообщения
 */
function showSuccessMessage(message) {
    alert(message);
}

/**
 * Показывает сообщение об ошибке
 * @param {string} message - текст ошибки
 */
function showErrorMessage(message) {
    console.error(message);
    alert(`Произошла ошибка:\n${message}`);
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
    const selectAllCheckbox = document.getElementById("selectAll");
    const addRowBtn = document.getElementById("addRowBtn");
    const tbody = document.getElementById("itemsTbody");
    const deleteRowBtn = document.getElementById("deleteRowBtn");

    // Обработчик для главного чекбокса (Выбрать все)
    selectAllCheckbox.addEventListener("change", function () {
        const isChecked = this.checked;

        // Получаем ВСЕ чекбоксы строк (включая динамически добавленные)
        const allRowCheckboxes = document.querySelectorAll("#itemsTable tbody .row-checkbox");

        allRowCheckboxes.forEach((checkbox) => {
            checkbox.checked = isChecked;
        });

        // Обновляем состояние главного чекбокса
        updateSelectAllState();
    });

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
});

                                                                                            /* МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ КП ИЗ ФАЙЛА*/
const openBtn = document.getElementById('openFileUploadBtn');

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

    openBtn.addEventListener('click', function() {
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
        modal.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            const file = fileInput.files[0];

            if (!file) {
                alert('Пожалуйста, выберите файл!');
                return;
            }

            console.log('Загружается файл:', file.name);
            alert('Файл успешно загружен!');
            closeModal();
        });
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.querySelector('.modal-overlay')) {
            closeModal();
        }
    });