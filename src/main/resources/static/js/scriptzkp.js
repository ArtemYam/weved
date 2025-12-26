document.addEventListener('DOMContentLoaded', function() {
    const numberInput = document.getElementById('number');

    // Проверка элемента
    if (!numberInput) {
        console.error('Элемент #number не найден!');
        return;
    }

    const API = {
        NEXT_NUMBER: '/api/documents/next-number',
        SAVE: '/api/documents/save'
    };

    async function fetchAndSaveDocumentNumber() {
        try {
            // Шаг 1: Получаем новый номер
            const response = await fetch(API.NEXT_NUMBER);
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }

            const data = await response.json();
            if (!data.documentNumber) {  // ← исправлено!
                throw new Error('Сервер не вернул номер');
            }

            numberInput.value = data.documentNumber;  // ← исправлено!

            // Шаг 2: Сохраняем документ
            const saveResponse = await fetch(API.SAVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documentNumber: data.documentNumber })  // ← ключ должен совпадать!
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || `HTTP ошибка: ${saveResponse.status}`);
            }

            console.log('Документ сохранён:', data.documentNumber);

        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Произошла ошибка: ' + error.message);
        }
    }

    fetchAndSaveDocumentNumber();
});
