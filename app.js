const USD_TO_INR = 86;
let data = JSON.parse(localStorage.getItem("wistData")) || [];

const tableBody = document.getElementById("tableBody");
const form = document.getElementById("entryForm");
document.getElementById("date").valueAsDate = new Date();

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}

function paypalFee(v) {
  return +(v * 0.0499 + 0.49).toFixed(2);
}

function render() {
  tableBody.innerHTML = "";

  let tw=0, tu=0, ti=0, tp=0, tpr=0;

  data.forEach((e,i)=>{
    const usd = +(e.wist / e.rate).toFixed(2);
    const inr = +(usd * USD_TO_INR).toFixed(2);
    const fee = paypalFee(e.paypal);
    const profit = +(e.paypal - fee).toFixed(2);

    tw+=e.wist; tu+=usd; ti+=inr; tp+=e.paypal; tpr+=profit;

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
      </tr>`;
  });

  totalWist.innerText = tw;
  totalUsd.innerText = tu.toFixed(2);
  totalInr.innerText = ti.toFixed(2);
  totalPaypal.innerText = tp.toFixed(2);
  totalProfit.innerText = tpr.toFixed(2);

  localStorage.setItem("wistData", JSON.stringify(data));
}

function del(i){
  data.splice(i,1);
  render();
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  data.push({
    date:date.value,
    wist:+wist.value,
    rate:+rate.value,
    paypal:+paypal.value,
    status:status.value,
    notes:notes.value
  });
  form.reset();
  date.valueAsDate=new Date();
  render();
});

function exportCSV(){
  if(!data.length) return alert("No data");

  let csv="Date,Wist,Rate,USD,INR,PayPal,Fee,Profit,Status\n";
  data.forEach(e=>{
    const usd=(e.wist/e.rate).toFixed(2);
    const inr=(usd*USD_TO_INR).toFixed(2);
    const fee=paypalFee(e.paypal).toFixed(2);
    const profit=(e.paypal-fee).toFixed(2);
    csv+=`${e.date},${e.wist},${e.rate},${usd},${inr},${e.paypal},${fee},${profit},${e.status}\n`;
  });

  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="discord-earnings.csv";
  a.click();
}

function importCSV(ev){
  const f=ev.target.files[0];
  if(!f||!confirm("Replace existing data?")) return;

  const r=new FileReader();
  r.onload=e=>{
    const lines=e.target.result.trim().split("\n");
    lines.shift();
    data=lines.map(l=>{
      const [date,wist,rate,, ,paypal,, ,status]=l.split(",");
      return {date,wist:+wist,rate:+rate,paypal:+paypal,status:status||"Paid",notes:""};
    });
    render();
    alert("Import successful");
  };
  r.readAsText(f);
  ev.target.value="";
}

render();

