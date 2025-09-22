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
        
        // Валидация на клиенте
        if (!nickname) {
            showAlert('❌ Введите ваш никнейм!', 'error');
            return;
        }
        
        if (selectedItems.length === 0) {
            showAlert('❌ Выберите хотя бы один брейнрот!', 'error');
            return;
        }
        
        // Отправка заказа через API
        await sendOrder(nickname, message);
    });
}

// Функция отправки заказа через серверный API
async function sendOrder(nickname, userMessage) {
    const button = document.querySelector('#orderForm button[type="submit"]');
    const originalText = button.innerHTML;
    
    // Показываем загрузку
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    button.disabled = true;
    
    try {
        // Отправляем POST запрос на наш сервер
        const response = await fetch('/api/send-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nickname: nickname,
                selectedItems: selectedItems,
                userMessage: userMessage
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAlert('✅ Заказ отправлен! С вами свяжутся в Roblox', 'success');
            resetForm();
        } else {
            showAlert(`❌ ${data.message || 'Ошибка при отправке заказа'}`, 'error');
        }
        
    } catch (error) {
        console.error('Ошибка сети:', error);
        showAlert('❌ Ошибка сети. Проверьте подключение к интернету', 'error');
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
    
    // Обновляем отображение корзины
    updateSelection();
}

// Показ уведомлений пользователю
function showAlert(message, type) {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Создаем элемент уведомления
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" title="Закрыть">×</button>
    `;
    
    // Устанавливаем стили в зависимости от типа
    if (type === 'success') {
        alert.style.background = 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)';
    } else if (type === 'error') {
        alert.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #e55656 100%)';
    }
    
    // Общие стили для уведомления
    alert.style.position = 'fixed';
    alert.style.top = '25px';
    alert.style.right = '25px';
    alert.style.padding = '18px 25px';
    alert.style.borderRadius = '12px';
    alert.style.color = 'white';
    alert.style.fontWeight = '600';
    alert.style.zIndex = '1000';
    alert.style.display = 'flex';
    alert.style.alignItems = 'center';
    alert.style.gap = '12px';
    alert.style.minWidth = '350px';
    alert.style.maxWidth = '500px';
    alert.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    alert.style.backdropFilter = 'blur(20px)';
    alert.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    alert.style.animation = 'slideInRight 0.5s ease-out';
    
    // Стили для кнопки закрытия
    const closeButton = alert.querySelector('button');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = 'auto';
    closeButton.style.opacity = '0.8';
    closeButton.style.transition = 'opacity 0.3s ease';
    closeButton.style.padding = '0';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    
    closeButton.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
    });
    
    closeButton.addEventListener('mouseleave', function() {
        this.style.opacity = '0.8';
    });
    
    // Добавляем CSS анимацию для уведомлений (если еще не добавлена)
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Добавляем уведомление на страницу
    document.body.appendChild(alert);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 500);
        }
    }, 5000);
}
