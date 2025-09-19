document.addEventListener('DOMContentLoaded', () => {
    const items = [
        { key: 'grape', name: '포도 씨앗', emoji: '🍇' },
        { key: 'strawberry', name: '딸기 씨앗', emoji: '🍓' },
        { key: 'mango', name: '망고 씨앗', emoji: '🥭' },
        { key: 'apple', name: '사과 씨앗', emoji: '🍎' }
    ];

    const myCoinsEl = document.getElementById('my-coins');
    const itemGridEl = document.getElementById('item-grid');
    const summaryListEl = document.getElementById('summary-list');
    const purchaseBtnEl = document.getElementById('purchase-btn');

    let myCoins = 0;
    let cart = { grape: 0, strawberry: 0, mango: 0, apple: 0 };

    async function initializeShop() {
        const response = await fetch('/api/user-data');
        const data = await response.json();
        myCoins = data.coins;
        myCoinsEl.textContent = myCoins;
        renderItems();
        updateSummary();
    }

    function renderItems() {
        itemGridEl.innerHTML = '';
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'shop-card';
            itemCard.innerHTML = `
                <img src="/images/${item.key}.png" alt="${item.name}" class="shop-img">
                <h3 class="shop-item-name">${item.name}</h3>
                <div class="item-controls">
                    <button class="quantity-btn" data-item="${item.key}" data-amount="-1">-</button>
                    <span class="quantity" id="quantity-${item.key}">0</span>
                    <button class="quantity-btn" data-item="${item.key}" data-amount="1">+</button>
                </div>
            `;
            itemGridEl.appendChild(itemCard);
        });
    }

    itemGridEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const itemName = e.target.dataset.item;
            const amount = parseInt(e.target.dataset.amount, 10);

            if (cart[itemName] + amount >= 0) {
                cart[itemName] += amount;
                document.getElementById(`quantity-${itemName}`).textContent = cart[itemName];
                updateSummary();
            }
        }
    });

    function updateSummary() {
        let totalQuantity = 0;
        let summaryHTML = '';
        
        items.forEach(item => {
            if (cart[item.key] > 0) {
                summaryHTML += `<p>${item.name}: ${cart[item.key]}개</p>`;
                totalQuantity += cart[item.key];
            }
        });

        if (totalQuantity === 0) {
            summaryHTML = '<p>구매할 아이템이 없습니다.</p>';
            purchaseBtnEl.disabled = true;
            purchaseBtnEl.textContent = `총 0개 구매하기 (0 코인)`;
        } else {
            purchaseBtnEl.disabled = myCoins < totalQuantity;
            purchaseBtnEl.textContent = `총 ${totalQuantity}개 구매하기 (${totalQuantity * 5} 코인)`;
        }
        summaryListEl.innerHTML = summaryHTML;
    }

    purchaseBtnEl.addEventListener('click', async () => {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cart })
        });
        const result = await response.json();
        
        alert(result.message);

        if (result.success) {
            myCoins = result.coins;
            myCoinsEl.textContent = myCoins;
            cart = { grape: 0, strawberry: 0, mango: 0, apple: 0 };
            document.querySelectorAll('.quantity').forEach(el => el.textContent = 0);
            updateSummary();
        }
    });

    initializeShop();
});