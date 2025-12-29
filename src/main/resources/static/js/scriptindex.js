document.addEventListener('DOMContentLoaded', function() {
    loadActiveOrders();
});

async function loadActiveOrders() {
    const tbody = document.querySelector('#ordersTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');

    try {
        const response = await fetch('/api/orders/active');
        if (!response.ok) {
            throw new Error('Ошибка загрузки заявок');
        }

        const orders = await response.json();

        // Очищаем таблицу
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Нет активных заявок</td></tr>';
        } else {
            orders.forEach(order => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${order.documentNumber}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>${order.manager}</td>
                    <td>${order.status}</td>
                `;

                // 1. Добавляем обработчик двойного клика
                row.addEventListener('dblclick', function() {
                    const documentNumber = order.documentNumber;
                    if (documentNumber) {
                        // 2. Переходим на страницу zayavka с параметром
                        window.location.href = `zayavka.html?documentNumber=${encodeURIComponent(documentNumber)}`;
                    } else {
                        alert('Не удалось получить номер заявки.');
                    }
                });

                tbody.appendChild(row);
            });
        }

        loadingMessage.style.display = 'none'; // Скрываем сообщение о загрузке

    } catch (error) {
        console.error('Ошибка:', error);
        tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки данных</td></tr>';
        loadingMessage.textContent = 'Ошибка загрузки данных';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU'); // или 'dd.MM.yyyy' вручную
}
