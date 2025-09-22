// Функция отправки заказа напрямую в Telegram
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
        const url = `https://api.telegram.org/bot8332292030:AAE05VXZVX6cbxQKNQAS_4Zg7rfnZc8MMqU/sendMessage?chat_id=7474847646&text=${message}`;
        
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
