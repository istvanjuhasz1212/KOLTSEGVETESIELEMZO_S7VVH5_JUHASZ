document.addEventListener('DOMContentLoaded', function() {
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
    
    // Kiadás hozzáadása
    document.getElementById('add-expense').addEventListener('click', function() {
        const container = document.getElementById('expense-container');
        const newItem = document.createElement('div');
        newItem.className = 'expense-item mb-3';
        newItem.innerHTML = `
            <input type="text" class="form-control mb-2" placeholder="Kiadás neve" required>
            <input type="number" class="form-control mb-2" placeholder="Összeg (Ft)" min="0" required>
            <select class="form-control mb-2" required>
                <option value="">Válassz kategóriát</option>
                <option value="Alapvető">Alapvető</option>
                <option value="Szórakozás">Szórakozás</option>
                <option value="Lakhatás">Lakhatás</option>
                <option value="Közlekedés">Közlekedés</option>
                <option value="Egészség">Egészség</option>
                <option value="Egyéb">Egyéb</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary remove-item">Törlés</button>
        `;
        container.appendChild(newItem);
        
        // Törlés gomb
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            container.removeChild(newItem);
        });
    });
    
    // Elemzés indítása
    document.getElementById('analyze-btn').addEventListener('click', function() {
        // Adatok összegyűjtése
        const incomes = collectIncomes();
        const expenses = collectExpenses();
        
        if (incomes.length === 0 || expenses.length === 0) {
            alert('Kérjük adjon meg legalább egy bevételt és egy kiadást!');
            return;
        }
        
        // API hívás
        fetch('http://localhost:5001/api/budget/analyze', {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              incomes: incomes,
              expenses: expenses
            })
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('Hálózati válasz nem megfelelő');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Hiba a kérés során:', error);
            alert('Hiba történt az elemzés során: ' + error.message);
        });
    });
    
    function collectIncomes() {
        const incomeItems = document.querySelectorAll('.income-item');
        const incomes = [];
        
        incomeItems.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const source = inputs[0].value.trim();
            const amount = parseFloat(inputs[1].value);
            
            if (source && !isNaN(amount) && amount > 0) {
                incomes.push({
                    source: source,
                    amount: amount
                });
            }
        });
        
        return incomes;
    }

    function collectExpenses() {
        const expenseItems = document.querySelectorAll('.expense-item');
        const expenses = [];
        
        expenseItems.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const select = item.querySelector('select');
            
            const name = inputs[0].value.trim();
            const amount = parseFloat(inputs[1].value);
            const category = select.value;
            
            if (name && !isNaN(amount) && amount > 0 && category) {
                expenses.push({
                    name: name,
                    amount: amount,
                    category: category
                });
            }
        });
        
        return expenses;
    }

    function displayResults(data) {
        const resultsDiv = document.getElementById('results');
        const summaryDiv = document.getElementById('summary');
        
        // Összegzés megjelenítése
        summaryDiv.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6>Összes bevétel</h6>
                            <h4>${formatCurrency(data.totalIncome)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6>Összes kiadás</h6>
                            <h4>${formatCurrency(data.totalExpenses)}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card ${data.status === 'savings' ? 'bg-success' : 'bg-danger'} text-white">
                        <div class="card-body">
                            <h6>${data.status === 'savings' ? 'Megtakarítás' : 'Hiány'}</h6>
                            <h4>${formatCurrency(Math.abs(data.savings))}</h4>
                            ${data.expenseWarning ? `<p class="warning">${data.expenseWarning}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Kategóriánkénti kiadások diagram
        const chartContainer = document.getElementById('category-chart');
        chartContainer.innerHTML = '';
        
        // Legnagyobb érték meghatározása a skálázáshoz
        const maxExpense = Math.max(...Object.values(data.expensesByCategory), 0);
        
        for (const [category, amount] of Object.entries(data.expensesByCategory)) {
            const percentage = maxExpense > 0 ? (amount / maxExpense) * 100 : 0;
            
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            barElement.innerHTML = `
                <div class="chart-bar-label">${category}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="chart-bar-amount">${formatCurrency(amount)}</div>
            `;
            
            chartContainer.appendChild(barElement);
        }
        
        // Megtakarítás/hiány diagram
        const savingsChart = document.getElementById('savings-chart');
        savingsChart.innerHTML = '';
        
        const total = Math.max(Math.abs(data.savings), data.totalIncome);
        const savingsWidth = (Math.abs(data.savings) / total) * 100;
        
        const savingsFill = document.createElement('div');
        savingsFill.className = `savings-fill ${data.status === 'savings' ? 'savings-positive' : 'savings-negative'}`;
        savingsFill.style.width = `${savingsWidth}%`;
        
        const savingsText = document.createElement('div');
        savingsText.className = 'px-3';
        savingsText.textContent = `${data.status === 'savings' ? 'Megtakarítás' : 'Hiány'}: ${formatCurrency(Math.abs(data.savings))}`;
        
        savingsChart.appendChild(savingsFill);
        savingsChart.appendChild(savingsText);
        
        // Eredmények megjelenítése
        resultsDiv.classList.remove('d-none');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
});