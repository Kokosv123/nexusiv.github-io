const tg = window.Telegram.WebApp;
tg.expand();

// Переводы
const translations = {
    en: {
        subtitle: "Digital Licenses & Keys",
        month1: "1 Month",
        month3: "3 Months",
        year1: "Forever",
        feat_access: "✅ Access to soft",
        feat_support: "✅ Basic support",
        feat_no_cfg: "❌ Private Configs",
        feat_all_base: "✅ All Base features",
        feat_prio: "✅ Queue Priority",
        feat_beta: "✅ Beta Access",
        feat_full: "👑 Full Access",
        feat_manager: "👑 Personal Manager",
        feat_dlc: "👑 DLC Early Access",
        btn_select: "SELECT",
        btn_buy: "BUY NOW",
        pop_badge: "POPULAR",
        best_badge: "BEST VALUE"
    },
    ru: {
        subtitle: "Цифровые ключи и лицензии",
        month1: "1 Месяц",
        month3: "3 Месяца",
        year1: "Навсегда",
        feat_access: "✅ Доступ к софту",
        feat_support: "✅ Базовая поддержка",
        feat_no_cfg: "❌ Приватные конфиги",
        feat_all_base: "✅ Все функции Base",
        feat_prio: "✅ Приоритет в очереди",
        feat_beta: "✅ Доступ к Beta",
        feat_full: "👑 Полный доступ",
        feat_manager: "👑 Личный менеджер",
        feat_dlc: "👑 Ранний доступ к DLC",
        btn_select: "ВЫБРАТЬ",
        btn_buy: "КУПИТЬ",
        pop_badge: "ПОПУЛЯРНО",
        best_badge: "ВЫГОДНО"
    },
    ua: {
        subtitle: "Цифрові ключі та ліцензії",
        month1: "1 Місяць",
        month3: "3 Місяці",
        year1: "Назавжди",
        feat_access: "✅ Доступ до софту",
        feat_support: "✅ Базова підтримка",
        feat_no_cfg: "❌ Приватні конфіги",
        feat_all_base: "✅ Всі функції Base",
        feat_prio: "✅ Пріоритет у черзі",
        feat_beta: "✅ Доступ до Beta",
        feat_full: "👑 Повний доступ",
        feat_manager: "👑 Особистий менеджер",
        feat_dlc: "👑 Ранній доступ до DLC",
        btn_select: "ОБРАТИ",
        btn_buy: "КУПИТИ",
        pop_badge: "ПОПУЛЯРНО",
        best_badge: "ВИГІДНО"
    }
};

const rates = { USD: 1, USDT: 1, EUR: 0.92, RUB: 92.5, UAH: 41.5 };
const symbols = { USD: '$', USDT: '₮', EUR: '€', RUB: '₽', UAH: '₴' };

let currentLang = 'en';
let currentCurrency = 'USD';
let selectedPlan = null;
let selectedPrice = 0;

// Инициализация языка
function init() {
    // Пытаемся взять язык из Телеграма (ru, uk, en...)
    let userLang = tg.initDataUnsafe?.user?.language_code || 'en';
    if (userLang === 'uk' || userLang === 'ua') userLang = 'ua';
    if (userLang !== 'ru' && userLang !== 'ua') userLang = 'en';
    
    setLanguage(userLang);
    setCurrency('USD');
}

function setLanguage(lang) {
    currentLang = lang;
    
    // UI кнопок
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase() === lang) btn.classList.add('active');
    });

    // Тексты
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Если кнопка уже была "Купить", обновляем её текст
    document.querySelectorAll('.card.selected .buy-btn').forEach(btn => {
        btn.textContent = translations[lang]['btn_buy'];
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

function handleCardClick(plan, basePrice) {
    // Если этот план уже выбран -> ПОКУПАЕМ
    if (selectedPlan === plan) {
        const data = `buy_${plan}_${basePrice}`;
        tg.sendData(data); // Закрывает окно и шлет данные боту
        return;
    }

    // Иначе -> ВЫБИРАЕМ
    selectedPlan = plan;
    selectedPrice = basePrice;

    // Сброс всех карт
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.buy-btn').textContent = translations[currentLang]['btn_select'];
    });

    // Подсветка текущей
    const card = document.querySelector(`.card.${plan.toLowerCase()}`);
    card.classList.add('selected');
    card.querySelector('.buy-btn').textContent = translations[currentLang]['btn_buy'];

    // Кнопка телеграма внизу тоже
    tg.MainButton.text = `${translations[currentLang]['btn_buy']} ${plan}`;
    tg.MainButton.show();
}

tg.MainButton.onClick(() => {
    if (selectedPlan) {
        const data = `buy_${selectedPlan}_${selectedPrice}`;
        tg.sendData(data);
    }
});

init();
