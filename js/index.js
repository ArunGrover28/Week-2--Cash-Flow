let salary = 0;
let currentCurrency = "INR";
let exchangeRate = 1; // INR → INR default

let expenses = [];

const salaryInput = document.getElementById("salaryInput");
const salaryDisplay = document.getElementById("salaryDisplay");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");

const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");
const balanceText = document.getElementById("balanceText");

const setSalaryBtn = document.getElementById("setSalaryBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");

let chart;

document.getElementById("currencySelect").addEventListener("change", (e) => {
  currentCurrency = e.target.value;
  fetchExchangeRate(currentCurrency);
});

function formatCurrency(value) {
  return (value * exchangeRate).toFixed(2);
}

// ----------------- LOCAL STORAGE -----------------
function saveData() {
  localStorage.setItem("salary", salary);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadData() {
  salary = Number(localStorage.getItem("salary")) || 0;
  expenses = JSON.parse(localStorage.getItem("expenses")) || [];
}

// ----------------- CALCULATIONS -----------------
function calculateTotalExpenses() {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

function updateUI() {

  salaryDisplay.textContent = formatCurrency(salary);
  expenseList.innerHTML = "";

  expenses.forEach(exp => {
  const li = document.createElement("li");

  // Convert expense amount for display
  const convertedAmount = formatCurrency(exp.amount);

  li.innerHTML = `
    ${exp.name} - ${convertedAmount} ${currentCurrency}
    <span class="delete" onclick="deleteExpense(${exp.id})">🗑️</span>
  `;
  expenseList.appendChild(li);
});


  const totalExpenses = calculateTotalExpenses();
  totalExpenseEl.textContent = formatCurrency(totalExpenses);

  const balance = salary - totalExpenses;
  balanceEl.textContent = formatCurrency(balance);

  // Budget Alert
  if (balance < salary * 0.1) {
    balanceText.style.color = "red";
    alert("⚠️ Warning: Balance below 10%");
  } else {
    balanceText.style.color = "black";
  }

  updateChart(totalExpenses, balance);
  saveData();
}

// ----------------- EVENTS -----------------
setSalaryBtn.addEventListener("click", () => {
  salary = Number(salaryInput.value);
  if (salary <= 0) return alert("Enter valid salary");
  updateUI();
});

addExpenseBtn.addEventListener("click", () => {
  const name = expenseName.value.trim();
  const amount = Number(expenseAmount.value);

  if (!name || amount <= 0) {
    return alert("Invalid expense input");
  }

  expenses.push({
    id: Date.now(),
    name,
    amount
  });

  expenseName.value = "";
  expenseAmount.value = "";

  updateUI();
});

function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  updateUI();
}

// ----------------- CHART -----------------
function updateChart(expense, balance) {
  const ctx = document.getElementById("expenseChart");

  if (chart) chart.destroy();

 chart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Expenses", "Remaining"],
    datasets: [{
      data: [expense, balance],
      backgroundColor: ["#ff6384", "#36a2eb"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

}
// ------------------ PDF ---------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(16);
  doc.text("Cash Flow Report", 10, y);

  y += 10;
  doc.setFontSize(12);
  doc.text(`Total Salary: ${salary}`, 10, y);

  y += 10;
  doc.text("Expenses:", 10, y);

  y += 8;

  if (expenses.length === 0) {
    doc.text("No expenses added.", 10, y);
    y += 8;
  } else {
    expenses.forEach((exp, index) => {
      doc.text(
        `${index + 1}. ${exp.name} - ${exp.amount}`,
        10,
        y
      );
      y += 8;
    });
  }

  y += 5;
  const totalExpenses = calculateTotalExpenses();
  const balance = salary - totalExpenses;

  doc.text(`Total Expenses: ${totalExpenses}`, 10, y);
  y += 8;
  doc.text(`Remaining Balance: ${balance}`, 10, y);

  doc.save("cash-flow-report.pdf");
}
//-------------------- Currency Converter---------------
async function fetchExchangeRate(currency) {
  if (currency === "INR") {
    exchangeRate = 1;
    updateUI();
    return;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=INR&to=${currency}`
    );
    const data = await res.json();
    exchangeRate = data.rates[currency];
    updateUI();
  } catch (err) {
    alert("Currency conversion failed");
  }
}




// ----------------- INIT -----------------
loadData();
updateUI();


