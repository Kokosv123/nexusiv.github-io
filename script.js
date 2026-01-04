const tg = window.Telegram.WebApp;

// Сообщаем телеграму, что приложение готово
tg.ready();
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
function init() {
    try {
        let userLang = tg.initDataUnsafe?.user?.language_code || 'en';
        if (userLang === 'uk' || userLang === 'ua') userLang = 'ua';
        if (userLang !== 'ru' && userLang !== 'ua') userLang = 'en';
        setLanguage(userLang);
        setCurrency('USD');
    } catch (e) {
        alert("Ошибка инициализации: " + e.message);
    }
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase() === lang) btn.classList.add('active');
    });
    
    // Обновляем тексты кнопок на карточках
    document.querySelectorAll('.card').forEach(card => {
        const btn = card.querySelector('.buy-btn');
        // Если карта выбрана - текст "КУПИТЬ", иначе "ВЫБРАТЬ"
        if (card.classList.contains('selected')) {
            btn.textContent = translations[lang]['btn_buy'];
        } else {
            btn.textContent = translations[lang]['btn_select'];
        }
    });
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

// ГЛАВНАЯ ФУНКЦИЯ КЛИКА
function handleCardClick(plan, basePrice) {
    try {
        // 1. Если этот план УЖЕ выбран -> Пытаемся купить
        if (selectedPlan === plan) {
            const data = `buy_${plan}_${basePrice}`;
            
            // Проверка: мы вообще в Телеграме?
            if (!tg.initData) {
                alert("Ошибка: Сайт открыт не в Telegram! Откройте через бота.");
                return;
            }

            // Отправляем данные
            tg.sendData(data); 
            
            // На всякий случай закрываем принудительно, если sendData сработал, но окно висит
            setTimeout(() => {
                tg.close();
            }, 100); 
            return;
        }

        // 2. Если план НЕ выбран -> Выбираем его
        selectedPlan = plan;
        selectedPrice = basePrice;

        // Сброс стилей
        document.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected');
            c.querySelector('.buy-btn').textContent = translations[currentLang]['btn_select'];
        });

        // Подсветка текущей
        const card = document.querySelector(`.card.${plan.toLowerCase()}`);
        if (card) {
            card.classList.add('selected');
            card.querySelector('.buy-btn').textContent = translations[currentLang]['btn_buy'];
        }

        // Показываем нижнюю синюю кнопку Telegram
        tg.MainButton.text = `${translations[currentLang]['btn_buy']} ${plan}`;
        tg.MainButton.show();

    } catch (e) {
        alert("Ошибка в handleCardClick: " + e.message);
    }
}

// Обработка нижней синей кнопки
tg.MainButton.onClick(() => {
    if (selectedPlan) {
        const data = `buy_${selectedPlan}_${selectedPrice}`;
        tg.sendData(data);
    } else {
        alert("Сначала выберите тариф!");
    }
});

init();
