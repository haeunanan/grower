document.addEventListener('DOMContentLoaded', () => {
    const inventoryGridEl = document.getElementById('inventory-grid');

    const seedInfo = {
        grape: { name: '포도 씨앗' },
        strawberry: { name: '딸기 씨앗' },
        mango: { name: '망고 씨앗' },
        apple: { name: '사과 씨앗' }
    };

    async function loadInventory() {
        const response = await fetch('/api/user-data');
        const data = await response.json();
        const inventory = data.inventory;

        inventoryGridEl.innerHTML = '';
        let hasItems = false;

        for (const seedKey in inventory) {
            const quantity = inventory[seedKey];
            if (quantity > 0) {
                hasItems = true;
                const info = seedInfo[seedKey];
                const itemCard = document.createElement('div');
                itemCard.className = 'inventory-card';
                itemCard.innerHTML = `
                    <img src="/images/${seedKey}.png" alt="${info.name}" class="inventory-img">
                    <h3 class="inventory-name">${info.name}</h3>
                    <div class="inventory-quantity">x ${quantity}</div>
                `;
                inventoryGridEl.appendChild(itemCard);
            }
        }

        if (!hasItems) {
            inventoryGridEl.innerHTML = '<p>보유 중인 씨앗이 없습니다. 상점에서 구매해주세요!</p>';
        }
    }

    loadInventory();
});