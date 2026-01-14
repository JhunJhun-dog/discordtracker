// ===== CONFIG =====
const USD_TO_INR = 86; // 1 USD = 86 INR

// ===== DATA STORAGE =====
let data = JSON.parse(localStorage.getItem("wistData")) || [];

// ===== ELEMENTS =====
const tableBody = document.getElementById("tableBody");
const form = document.getElementById("entryForm");

// Set default date
document.getElementById("date").valueAsDate = new Date();

// ===== HELPERS =====
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// PayPal fee: 4.99% + $0.49
function paypalFee(amount) {
  return +(amount * 0.0499 + 0.49).toFixed(2);
}

// ===== RENDER UI =====
function render() {
  tableBody.innerHTML = "";

  let totalWist = 0;
  let totalUsd = 0;
  let totalInr = 0;
  let totalPaypal = 0;
  let totalProfit = 0;

  data.forEach((e, i) => {
    if (!e.status) e.status = "Paid";

    const usd = +(e.wist / e.rate).toFixed(2);
    const inr = +(usd * USD_TO_INR).toFixed(2);
    const fee = paypalFee(e.paypal);
    const profit = +(e.paypal - fee).toFixed(2);

    totalWist += e.wist;
    totalUsd += usd;
    totalInr += inr;
    totalPaypal += e.paypal;
    totalProfit += profit;

    tableBody.innerHTML += `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.wist}</td>
        <td>$${usd}</td>
        <td>₹${inr}</td>
        <td>$${e.paypal}</td>
        <td>$${fee}</td>
        <td>$${profit}</td>
        <td>${e.status}</td>
        <td><button onclick="del(${i})">✅</button></td>
      </tr>
    `;
  });

  document.getElementById("totalWist").innerText = totalWist;
  document.getElementById("totalUsd").innerText = totalUsd.toFixed(2);
  document.getElementById("totalInr").innerText = totalInr.toFixed(2);
  document.getElementById("totalPaypal").innerText = totalPaypal.toFixed(2);
  document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);

  localStorage.setItem("wistData", JSON.stringify(data));
}

// ===== DELETE ENTRY =====
function del(index) {
  data.splice(index, 1);
  render();
}

// ===== ADD ENTRY =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

  data.push({
    date: date.value,
    wist: Number(wist.value),
    rate: Number(rate.value), // Wist per $1
    paypal: Number(paypal.value),
    status: status.value,
    notes: notes.value
  });

  form.reset();
  date.valueAsDate = new Date();
  render();
});

// ===== CSV EXPORT =====
function exportCSV() {
  if (!data.length) {
    alert("No data to export");
    return;
  }

  const headers = [
    "Date",
    "Wist",
    "Rate (Wist per $)",
    "USD",
    "INR",
    "PayPal",
    "Fee",
    "Profit",
    "Status"
  ];

  const rows = data.map(e => {
    const usd = (e.wist / e.rate).toFixed(2);
    const inr = (usd * USD_TO_INR).toFixed(2);
    const fee = paypalFee(e.paypal).toFixed(2);
    const profit = (e.paypal - fee).toFixed(2);

    return [
      formatDate(e.date),
      e.wist,
      e.rate,
      usd,
      inr,
      e.paypal,
      fee,
      profit,
      e.status
    ];
  });

  let csv = headers.join(",") + "\n";
  rows.forEach(r => (csv += r.join(",") + "\n"));

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "discord-earnings.csv";
  a.click();

  URL.revokeObjectURL(url);
}

// ===== INIT =====
render();

