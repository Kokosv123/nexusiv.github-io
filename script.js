const tg = window.Telegram.WebApp;
tg.expand();

// Примерные курсы валют (можно обновлять вручную или подключить API)
const rates = {
    USD: 1,
    USDT: 1,
    EUR: 0.92,
    RUB: 92.5,  // Примерный курс
    UAH: 41.5   // Примерный курс
};

const symbols = {
    USD: '$',
    USDT: '₮',
    EUR: '€',
    RUB: '₽',
    UAH: '₴'
};

let currentCurrency = 'USD';
let selectedPlan = null;
let selectedBasePrice = 0;

function setCurrency(currency) {
    currentCurrency = currency;
    
    // Обновляем кнопки валют
    document.querySelectorAll('.curr-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.includes(currency)) btn.classList.add('active');
    });

    // Обновляем цены в карточках
    document.querySelectorAll('.price-val').forEach(priceSpan => {
        const basePrice = parseFloat(priceSpan.getAttribute('data-base'));
        const converted = (basePrice * rates[currency]).toFixed(currency === 'RUB' || currency === 'UAH' ? 0 : 2); // Рубли/Гривны без копеек
        priceSpan.textContent = converted;
    });

    // Обновляем символы
    document.querySelectorAll('.currency-symbol').forEach(sym => {
        sym.textContent = symbols[currency];
    });

    // Сброс выбора при смене валюты (опционально, можно оставить)
    tg.MainButton.hide();
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
}

function selectCard(cardElement, planName, baseUsdPrice) {
    // Визуальное выделение
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.buy-btn').textContent = "ВЫБРАТЬ";
    });
    
    cardElement.classList.add('selected');
    cardElement.querySelector('.buy-btn').textContent = "КУПИТЬ СЕЙЧАС";

    // Сохраняем данные
    selectedPlan = planName;
    selectedBasePrice = baseUsdPrice;

    // Показываем нативную кнопку Telegram (MainButton)
    // Мы отправляем USDT/USD цену боту, даже если юзер видит рубли.
    // Crystal Pay сам сконвертирует при оплате.
    tg.MainButton.text = `КУПИТЬ ${planName} (${symbols[currentCurrency]}${(baseUsdPrice * rates[currentCurrency]).toFixed(2)})`;
    tg.MainButton.show();
}

// Обработка нажатия на большую синюю кнопку Telegram
Telegram.WebApp.onEvent('mainButtonClicked', function(){
    if (selectedPlan && selectedBasePrice) {
        // Формат отправки: buy_PLAN_USDPRIICE
        // Важно отправлять цену в долларах, так как сервер создает инвойс в USD/USDT
        const data = `buy_${selectedPlan}_${selectedBasePrice}`;
        tg.sendData(data);
    }
});

// Инициализация
setCurrency('USD');
