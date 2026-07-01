// ==============================
// SMARTLCD
// Загрузка товаров из Google Sheets
// ==============================

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search");
const brandFilter = document.getElementById("brandFilter");
const categoryFilter = document.getElementById("categoryFilter");

let products = [];

// Ссылка на опубликованный Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwp-x54OyGq5npBEiDqdTvvYtPBh_b2MnRTQcvhWR8nFbZ7nEtSeZeY0_ZyQbgRxQqjyg/exec";

// ==============================
// Загрузка товаров
// ==============================

async function loadProducts() {

    // 1. Показываем данные из кэша
    const cache = localStorage.getItem("products");
    const lastUpdate = Number(localStorage.getItem("products_time") || 0);

const CACHE_TIME = 60000; // 1 минута

if (cache && (Date.now() - lastUpdate) < CACHE_TIME) {

    products = JSON.parse(cache);

    fillBrands();
    fillCategories();
    render();

    return;

}

    if (cache) {

        products = JSON.parse(cache);

        fillBrands();
        fillCategories();
        render();

    } else {

        productsContainer.innerHTML = `
            <div class="empty">
                🔄 Загрузка товаров...
            </div>
        `;

    }

    // 2. Загружаем свежие данные из Google
    try {

        const response = await fetch(API_URL + "?t=" + Date.now());

        const data = await response.json();

        products = data;

        // сохраняем в браузере
        localStorage.setItem("products", JSON.stringify(products));

        // время обновления
        localStorage.setItem("products_time", Date.now());

        fillBrands();
        fillCategories();
        render();

    } catch (error) {

        console.log("Ошибка загрузки:", error);

        // если кэша нет
        if (!cache) {

            productsContainer.innerHTML = `
                <div class="empty">
                    Не удалось загрузить товары
                </div>
            `;

        }

    }

}

// ==============================
// Бренды
// ==============================

function fillBrands(){

    brandFilter.innerHTML =
        `<option value="">Все бренды</option>`;

    const brands = [...new Set(

        products.map(item=>item.brand)

    )];

    brands.sort();

    brands.forEach(brand=>{

        brandFilter.innerHTML += `
            <option value="${brand}">
                ${brand}
            </option>
        `;

    });

}

// ==============================
// Категории
// ==============================

function fillCategories(){

    categoryFilter.innerHTML =
        `<option value="">Все категории</option>`;

    const categories=[...new Set(

        products.map(item=>item.category)

    )];

    categories.sort();

    categories.forEach(category=>{

        categoryFilter.innerHTML+=`

            <option value="${category}">
                ${category}
            </option>

        `;

    });

}

// ==============================
// Слушатели
// ==============================

searchInput.addEventListener("input",render);

brandFilter.addEventListener("change",render);

categoryFilter.addEventListener("change",render);

// ==============================
// Отрисовка карточек
// ==============================

function render(){

    const search = searchInput.value.toLowerCase().trim();
    const brand = brandFilter.value;
    const category = categoryFilter.value;

    const filtered = products.filter(item=>{

        const matchSearch = (
            item.brand +
            " " +
            item.model +
            " " +
            item.quality
        ).toLowerCase().includes(search);

        const matchBrand =
            !brand || item.brand===brand;

        const matchCategory =
            !category || item.category===category;

        return (
            matchSearch &&
            matchBrand &&
            matchCategory
        );

    });

    if(filtered.length===0){

        productsContainer.innerHTML=`
            <div class="empty">
                Ничего не найдено
            </div>
        `;

        return;

    }

    productsContainer.innerHTML="";

    filtered.forEach(item=>{

        const card=document.createElement("div");

        card.className="card";

        card.innerHTML=`

<div class="badges">

<div class="badge">

${item.quality}

</div>

${item.frame=="Да" ? `

<div class="badge-frame">

С рамкой

</div>

` : ""}

</div>

<img

class="product-image"

src="${item.image}"

alt="${item.brand} ${item.model}"

onerror="this.src='https://placehold.co/600x600?text=SMARTLCD'"

>

<div class="card-body">

<div class="category">

${item.category}

</div>

<div class="brand">

${item.brand}

</div>

<div class="model">

${item.model}

</div>

<div class="stock ${Number(item.qty)>0 ? "available":"out"}">

${Number(item.qty)>0 ?

"✓ В наличии"

:

"✕ Нет в наличии"}

</div>

<div class="price">

${item.price} ₽

</div>

<div class="qty">

Остаток: ${item.qty} шт.

</div>

${
Number(item.qty)>0 ?

`

<a

class="btn"

target="_blank"

href="https://wa.me/79962805334?text=${encodeURIComponent(

`Здравствуйте!

Интересует

${item.category}

${item.brand}

${item.model}

Качество:

${item.quality}

Цена:

${item.price} ₽`

)}">

📲 Заказать в WhatsApp

</a>

`

:

""

}

</div>

`;

        productsContainer.appendChild(card);

    });

}

// ==============================
// Запуск
// ==============================

loadProducts();