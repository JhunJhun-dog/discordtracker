let data = JSON.parse(localStorage.getItem("wistData")) || [];

const tableBody = document.getElementById("tableBody");
const form = document.getElementById("entryForm");

document.getElementById("date").valueAsDate = new Date();

function monthName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
}

// PayPal fee: 4.99% + $0.49
function paypalFee(amount) {
  return +(amount * 0.0499 + 0.49).toFixed(2);
}

function render() {
  tableBody.innerHTML = "";

  let totalWist = 0;
  let totalUsd = 0;
  let totalPaypal = 0;
  let totalProfit = 0;

  data.forEach((e, i) => {
    if (!e.status) e.status = "Paid";

    const usd = +(e.wist / e.rate).toFixed(2);
    const fee = paypalFee(e.paypal);
    const profit = +(e.paypal - fee).toFixed(2);

    totalWist += e.wist;
    totalUsd += usd;
    totalPaypal += e.paypal;
    totalProfit += profit;

    tableBody.innerHTML += `
      <tr>
        <td>${monthName(e.date)}</td>
        <td>${e.wist}</td>
        <td>$${usd}</td>
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
  document.getElementById("totalPaypal").innerText = totalPaypal.toFixed(2);
  document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);

  localStorage.setItem("wistData", JSON.stringify(data));
}

function del(i) {
  data.splice(i, 1);
  render();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const entry = {
    date: date.value,
    wist: Number(wist.value),
    rate: Number(rate.value), // WIST per $1
    paypal: Number(paypal.value),
    status: status.value,
    notes: notes.value
  };

  data.push(entry);
  form.reset();
  date.valueAsDate = new Date();
  render();
});

// CSV EXPORT
function exportCSV() {
  if (!data.length) {
    alert("No data to export");
    return;
  }

  const headers = ["Month","Wist","Rate(WIST/$)","USD","PayPal","Fee","Profit","Status"];

  const rows = data.map(e => {
    const usd = (e.wist / e.rate).toFixed(2);
    const fee = paypalFee(e.paypal).toFixed(2);
    const profit = (e.paypal - fee).toFixed(2);

    return [
      monthName(e.date),
      e.wist,
      e.rate,
      usd,
      e.paypal,
      fee,
      profit,
      e.status
    ];
  });

  let csv = headers.join(",") + "\n";
  rows.forEach(r => csv += r.join(",") + "\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "discord-earnings.csv";
  a.click();

  URL.revokeObjectURL(url);
}

render();

