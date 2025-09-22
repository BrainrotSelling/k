// Конфигурация Telegram бота
const TELEGRAM_BOT_TOKEN = '8332292030:AAE05VXZVX6cbxQKNQAS_4Zg7rfnZc8MMqU';
const TELEGRAM_CHAT_ID = '7474847646';

// Переменные для хранения состояния
let selectedItems = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupItemSelection();
    setupFormHandler();
}

// Настройка выбора товаров
function setupItemSelection() {
    const items = document.querySelectorAll('.item-card');
    
    items.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateSelection();
        });
    });
}

// Обновление выбранных товаров
function updateSelection() {
    selectedItems = [];
    const selectedCards = document.querySelectorAll('.item-card.selected');
    const selectedContainer = document.getElementById('selectedItems');
    let noSelection = document.getElementById('noSelection');
    const totalElement = document.getElementById('totalPrice');
    
    // Собираем выбранные товары
    selectedCards.forEach(card => {
        selectedItems.push({
            name: card.dataset.name,
            price: parseInt(card.dataset.price)
        });
    });
    
    // Удаляем все selected-item элементы
    selectedContainer.querySelectorAll('.selected-item').forEach(item => item.remove());
    
    // Обновляем отображение
    if (selectedItems.length > 0) {
        // Скрываем сообщение "ничего не выбрано"
        if (noSelection) {
            noSelection.style.display = 'none';
        }
        
        // Добавляем каждый выбранный товар
        selectedItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'selected-item';
            itemDiv.innerHTML = `
                <span>${item.name}</span>
                <span class="price">${item.price} робуксов</span>
            `;
            selectedContainer.appendChild(itemDiv);
        });
    } else {
        // Показываем сообщение "ничего не выбрано"
        if (!noSelection) {
            noSelection = document.createElement('p');
            noSelection.id = 'noSelection';
            noSelection.textContent = 'Пока ничего не выбрано';
            selectedContainer.appendChild(noSelection);
        }
        noSelection.style.display = 'block';
    }
    
    // Обновляем итоговую сумму
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    totalElement.innerHTML = `<i class="fas fa-receipt"></i> Итого: ${total} робуксов`;
    
    // Добавляем или убираем анимацию пульсации в зависимости от суммы
    if (total > 0) {
        totalElement.classList.add('pulse');
    } else {
        totalElement.classList.remove('pulse');
    }
}

// Настройка обработчика формы
function setupFormHandler() {
    const form = document.getElementById('orderForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nickname = document.getElementById('nickname').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Валидация
        if (!nickname) {
            showAlert('❌ Введите ваш никнейм!', 'error');
            return;
        }
        
        if (selectedItems.length === 0) {
            showAlert('❌ Выберите хотя бы один брейнрот!', 'error');
            return;
        }
        
        // Отправка заказа
        await sendOrder(nickname, message);
    });
}

// Функция отправки заказа в Telegram
async function sendOrder(nickname, userMessage) {
    const button = document.querySelector('#orderForm button[type="submit"]');
    const originalText = button.innerHTML;
    
    // Показываем загрузку
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    button.disabled = true;
    
    try {
        // Формируем сообщение для Telegram
        const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
        
        let message = `🛒 НОВЫЙ ЗАКАЗ БРЕЙНРОТОВ%0A%0A`;
        message += `👤 Никнейм: ${encodeURIComponent(nickname)}%0A%0A`;
        
        message += `📦 Выбранные брейнроты:%0A`;
        selectedItems.forEach(item => {
            message += `• ${encodeURIComponent(item.name)} - ${item.price} Robux%0A`;
        });
        
        message += `%0A💰 Итого: ${total} Robux%0A`;
        
        if (userMessage) {
            message += `%0A📝 Сообщение: ${encodeURIComponent(userMessage)}%0A`;
        }
        
        message += `%0A⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
        
        // Отправляем запрос к Telegram API
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.ok) {
                showAlert('✅ Заказ отправлен! С вами свяжутся в Roblox', 'success');
                resetForm();
            } else {
                console.error('Ошибка Telegram:', data);
                showAlert('❌ Ошибка при отправке заказа', 'error');
            }
        } else {
            console.error('Ошибка HTTP:', response.status);
            showAlert('❌ Ошибка сети при отправке заказа', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        showAlert('❌ Ошибка сети при отправке заказа', 'error');
    } finally {
        // Восстанавливаем кнопку
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Сброс формы после успешной отправки
function resetForm() {
    // Сбрасываем форму
    document.getElementById('orderForm').reset();
    
    // Сбрасываем выбранные товары
    document.querySelectorAll('.item-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Обновляем отображение
    updateSelection();
}

// Показ уведомлений
function showAlert(message, type) {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Создаем элемент уведомления
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Добавляем стили
    if (type === 'success') {
        alert.style.backgroundColor = '#4CAF50';
    } else {
        alert.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(alert);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}
