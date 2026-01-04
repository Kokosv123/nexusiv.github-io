// 1. Глобальный перехватчик ошибок (Покажет, если что-то сломалось сразу)
window.onerror = function(message, source, lineno, colno, error) {
    alert("CRITICAL ERROR:\n" + message + "\nLine: " + lineno);
};

// Проверка: загрузился ли файл вообще
// alert("Script v5 Loaded!"); // Раскомментируйте, если хотите проверить, обновился ли файл

const tg = window.Telegram.WebApp;
tg.expand();

// Переводы
const translations = {
    en: { btn_select: "SELECT", btn_buy: "BUY NOW" },
    ru: { btn_select: "ВЫБРАТЬ", btn_buy: "КУПИТЬ" },
    ua: { btn_select: "ОБРАТИ", btn_buy: "КУПИТИ" }
};

const rates = { USD: 1, USDT: 1, EUR: 0.92, RUB: 92.5, UAH: 41.5 };
const symbols = { USD: '$', USDT: '₮', EUR: '€', RUB: '₽', UAH: '₴' };

let currentLang = 'en';
let currentCurrency = 'USD';
let selectedPlan = null;
let selectedPrice = 0;

// Инициализация
try {
    let userLang = tg.initDataUnsafe?.user?.language_code || 'en';
    if (userLang === 'uk' || userLang === 'ua') userLang = 'ua';
    if (userLang !== 'ru' && userLang !== 'ua') userLang = 'en';
    
    // Устанавливаем язык и валюту по умолчанию
    setLanguage(userLang);
    setCurrency('USD');
} catch (e) {
    alert("Init Error: " + e.message);
}

// Функции смены языка/валюты
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase() === lang) btn.classList.add('active');
    });
    updateButtons();
}

function setCurrency(curr) {
    currentCurrency = curr;
    document.querySelectorAll('.curr-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.includes(symbols[curr])) btn.classList.add('active');
    });

    document.querySelectorAll('.price-val').forEach(el => {
        const base = parseFloat(el.getAttribute('data-base'));
        const val = (base * rates[curr]).toFixed(curr === 'RUB' || curr === 'UAH' ? 0 : 2);
        el.textContent = val;
    });

    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = symbols[curr];
    });
}

function updateButtons() {
    document.querySelectorAll('.card').forEach(card => {
        const btn = card.querySelector('.buy-btn');
        if (card.classList.contains('selected')) {
            btn.textContent = translations[currentLang]['btn_buy'];
        } else {
            btn.textContent = translations[currentLang]['btn_select'];
        }
    });
}

// === ГЛАВНАЯ ФУНКЦИЯ КЛИКА ===
// Сделана глобальной (window.), чтобы HTML точно её увидел
window.handleCardClick = function(plan, basePrice) {
    try {
        // Логика двойного клика
        if (selectedPlan === plan) {
            // ВТОРОЙ КЛИК - ПОКУПКА
            
            if (!tg.initData) {
                alert("Ошибка: Приложение открыто не в Telegram!");
                return;
            }

            const data = `buy_${plan}_${basePrice}`;
            
            // alert("Отправка данных: " + data); // Отладка перед отправкой
            
            tg.sendData(data);
            return;
        }

        // ПЕРВЫЙ КЛИК - ВЫБОР
        selectedPlan = plan;
        selectedPrice = basePrice;

        // Сброс стилей
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

        // Подсветка новой карты
        const card = document.querySelector(`.card.${plan.toLowerCase()}`);
        if(card) card.classList.add('selected');

        // Обновление текстов кнопок
        updateButtons();

        // Показ MainButton (Синяя кнопка внизу)
        tg.MainButton.text = `${translations[currentLang]['btn_buy']} ${plan}`;
        tg.MainButton.show();

    } catch (e) {
        alert("Click Error: " + e.message);
    }
};

// Обработка синей кнопки Telegram
tg.MainButton.onClick(() => {
    if (selectedPlan) {
        tg.sendData(`buy_${selectedPlan}_${selectedPrice}`);
    } else {
        alert("Select a plan first!");
    }
});
