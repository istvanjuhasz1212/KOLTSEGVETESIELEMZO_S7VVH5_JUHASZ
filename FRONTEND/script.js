    // Bevétel hozzáadása
    document.getElementById('add-income').addEventListener('click', function() {
        const container = document.getElementById('income-container');
        const newItem = document.createElement('div');
        newItem.className = 'income-item mb-3';
        newItem.innerHTML = `
        <input type="text" class="form-control mb-2" placeholder="Bevétel forrása" required>
        <input type="number" class="form-control" placeholder="Összeg (Ft)" min="0" required>
        <button class="btn btn-sm btn-outline-secondary mt-2 remove-item">Törlés</button>
    `;
    
        container.appendChild(newItem);
        
        // Törlés gomb
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            container.removeChild(newItem);
        });
    });