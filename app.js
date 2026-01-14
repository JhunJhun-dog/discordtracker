let data = JSON.parse(localStorage.getItem("wistData")) || [];

const tableBody = document.getElementById("tableBody");

document.getElementById("date").valueAsDate = new Date();

function monthName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
}

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
    const usd = +(e.wist * e.rate).toFixed(2);
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
        <td>${e.status || "Paid"}</td>
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

document.getElementById("entryForm").addEventListener("submit", e => {
  e.preventDefault();

  data.push({
    date: date.value,
    wist: +wist.value,
    rate: +rate.value,
    paypal: +paypal.value,
    status: status.value,
    notes: notes.value
  });

  e.target.reset();
  date.valueAsDate = new Date();
  render();
});

render();
