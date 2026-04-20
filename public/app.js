const API_URL = "http://localhost:3000/api";

// ================= AUTH =================
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

// ================= ELEMENT =================
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");

const incomeList = document.getElementById("income-list");
const expenseList = document.getElementById("expense-list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

// ================= FORMAT =================
function format(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ================= ENTER UX =================
titleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    amountInput.focus();
  }
});

amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIncome();
  }
});

// ================= LOAD DATA =================
async function loadData() {
  const res = await fetch(`${API_URL}/transactions`, {
    headers: {
      Authorization: token
    }
  });

  const data = await res.json();

  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="${item.type}">
        ${item.title}
      </span>

      <div>
        ${format(item.amount)}
<button class="delete" onclick="deleteData('${item._id}')">🗑️</button>      
</div>
    `;

    if (item.type === "income") {
      incomeList.appendChild(li);
    } else {
      expenseList.appendChild(li);
    }
  });
}

// ================= LOAD STATS =================
async function loadStats() {
  const res = await fetch(`${API_URL}/stats`, {
    headers: {
      Authorization: token
    }
  });

  const data = await res.json();

  balanceEl.innerText = format(data.balance);
  incomeEl.innerText = format(data.income);
  expenseEl.innerText = format(data.expense);
}

// ================= TAMBAH =================
async function sendData(type) {
  if (!titleInput.value || !amountInput.value) {
    alert("Isi data dulu");
    return;
  }

  await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      title: titleInput.value,
      amount: parseInt(amountInput.value),
      type
    })
  });

  titleInput.value = "";
  amountInput.value = "";
  titleInput.focus();

  refresh();
}

function addIncome() {
  sendData("income");
}

function addExpense() {
  sendData("expense");
}

// ================= DELETE =================
async function deleteData(id) {
  const yakin = confirm("Hapus transaksi ini?");
  if (!yakin) return;

  await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  });

  refresh();
}

// ================= LOGOUT =================
function logout() {
  const yakin = confirm("Yakin mau keluar?");
  if (!yakin) return;

  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

// ================= REFRESH =================
function refresh() {
  loadData();
  loadStats();
}

// ================= INIT =================
refresh();

// ================= SERVICE WORKER =================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW aktif"));
}
