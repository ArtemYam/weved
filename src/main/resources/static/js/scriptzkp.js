// Ждём полной загрузки DOM, чтобы гарантировать наличие всех элементов на странице
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы из HTML
    const numberInput = document.getElementById('number');
    const dateInput = document.getElementById('date');  // ← Получаем поле для даты
    const managerSelect = document.getElementById('manager'); //Подставляем список менеджеров из БД

    // Проверка: существуют ли элементы в DOM
    if (!numberInput) {
        console.error('Элемент #number не найден!');
        return;
    }
    if (!dateInput) {  // ← Проверка поля даты
        console.error('Элемент #date не найден!');
        return;
    }
    if (!managerSelect) {  // ← Проверка менеджеров
            console.error('Элемент #manager не найден!');
            return;
        }

    // Объект с URL API для удобства и читаемости кода
    const API = {
        NEXT_NUMBER: '/api/documents/next-number',
        SAVE: '/api/documents/save'
    };

    // Функция для форматирования даты в формат YYYY-MM-DD (подходит для input[type="date"])
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');  // Месяц от 0 до 11
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Устанавливаем текущую дату в поле #date
    const today = new Date();
    dateInput.value = formatDate(today);  // ← Заполняем поле текущей датой

    // Функция для выбора менеджеров
    async function loadManagers() {  // ← Новая функция
            try {
                const response = await fetch('/api/users/managers');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const managers = await response.json();
                managerSelect.innerHTML = '<option value="">— Выберите менеджера —</option>';

                managers.forEach(manager => {
                    const option = document.createElement('option');
                    option.value = manager.id;
                    option.textContent = `${manager.username} ${manager.surname}`;
                    managerSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Ошибка:', error.message);
                managerSelect.innerHTML += '<option value="">Ошибка загрузки</option>';
            }
        }



    // Асинхронная функция для получения номера и сохранения документа
    async function fetchAndSaveDocumentNumber() {
        try {
            // Шаг 1: Отправляем GET‑запрос на получение нового номера документа
            const response = await fetch(API.NEXT_NUMBER);

            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }

            const data = await response.json();

            if (!data.documentNumber) {
                throw new Error('Сервер не вернул номер');
            }

            // Устанавливаем полученный номер в поле #number
            numberInput.value = data.documentNumber;

            // Шаг 2: Отправляем POST‑запрос для сохранения документа
            // Теперь включаем и номер, и дату
            const saveResponse = await fetch(API.SAVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    documentNumber: data.documentNumber,
                    createdAt: dateInput.value  // ← Добавляем дату в запрос
                })
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || `HTTP ошибка: ${saveResponse.status}`);
            }

            console.log('Документ сохранён:', data.documentNumber, 'Дата:', dateInput.value);

        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Произошла ошибка: ' + error.message);
        }
    }

    loadManagers();
    // Запускаем функцию сразу после загрузки страницы
    fetchAndSaveDocumentNumber();
});
