const prompt = require("prompt-sync")();
const fs = require("fs");

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

let saldo = 0;
let riwayat = [];

// ambil data jika ada
if (fs.existsSync("data.json")) {
  let data = JSON.parse(fs.readFileSync("data.json"));
  saldo = data.saldo;
  riwayat = data.riwayat || [];
}

function getTanggal() {
  let today = new Date();
  return today.toISOString().split("T")[0];
}

while (true) {
  console.log("\n=== APLIKASI KEUANGAN ===");
  console.log("1. Tambah Pemasukan");
  console.log("2. Tambah Pengeluaran");
  console.log("3. Lihat Saldo");
  console.log("4. Lihat Riwayat");
  console.log("5. Keluar");

  let pilihan = prompt("Pilih menu: ");

  if (pilihan == "1") {
    let pemasukan = parseInt(prompt("Masukkan pemasukan: "));
    let keterangan = prompt("Keterangan: ");

    saldo += pemasukan;

    riwayat.push({
      tipe: "pemasukan",
      jumlah: pemasukan,
      keterangan: keterangan,
      tanggal: getTanggal()
    });

    console.log("Pemasukan:", formatRupiah(pemasukan));
  } 
  
  else if (pilihan == "2") {
    let pengeluaran = parseInt(prompt("Masukkan pengeluaran: "));
    let keterangan = prompt("Keterangan: ");

    saldo -= pengeluaran;

    riwayat.push({
      tipe: "pengeluaran",
      jumlah: pengeluaran,
      keterangan: keterangan,
      tanggal: getTanggal()
    });

    console.log("Pengeluaran:", formatRupiah(pengeluaran));
  } 
  
  else if (pilihan == "3") {
    console.log("Saldo sekarang:", formatRupiah(saldo));
  } 
  
  else if (pilihan == "4") {
    console.log("\n=== RIWAYAT TRANSAKSI ===");

    if (riwayat.length === 0) {
      console.log("Belum ada transaksi");
    } else {
      riwayat.forEach((item, index) => {
        console.log(
          `${index + 1}. [${item.tanggal}] ${item.tipe} - ${formatRupiah(item.jumlah)} (${item.keterangan})`
        );
      });
    }
  } 
  
  else if (pilihan == "5") {
    fs.writeFileSync("data.json", JSON.stringify({ saldo, riwayat }));
    console.log("Data disimpan. Keluar...");
    break;
  } 
  
  else {
    console.log("Pilihan tidak valid");
  }
}