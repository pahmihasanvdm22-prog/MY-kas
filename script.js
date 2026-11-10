
const STORAGE_KEY = "myKasDashboard";

let transaksi = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
) || [
    {
        id: 1,
        nama: "Iuran kas warga",
        kategori: "Iuran",
        tanggal: "2026-11-10",
        jenis: "income",
        nominal: 560000,
        metode: "Transfer"
    },
    {
        id: 2,
        nama: "Pembelian perlengkapan",
        kategori: "Operasional",
        tanggal: "2026-11-09",
        jenis: "expense",
        nominal: 350000,
        metode: "Tunai"
    },
    {
        id: 3,
        nama: "Donasi kegiatan",
        kategori: "Donasi",
        tanggal: "2026-11-08",
        jenis: "income",
        nominal: 1250000,
        metode: "QRIS"
    },
    {
        id: 4,
        nama: "Konsumsi rapat",
        kategori: "Konsumsi",
        tanggal: "2026-11-07",
        jenis: "expense",
        nominal: 420000,
        metode: "Tunai"
    }
];

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

function simpanData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transaksi)
    );
}

function updateDashboard() {
    let pemasukan = 0;
    let pengeluaran = 0;

    transaksi.forEach(item => {
        if (item.jenis === "income") {
            pemasukan += item.nominal;
        } else {
            pengeluaran += item.nominal;
        }
    });

    document.getElementById("totalIncome").textContent =
        rupiah(pemasukan);

    document.getElementById("totalExpense").textContent =
        rupiah(pengeluaran);

    document.getElementById("totalBalance").textContent =
        rupiah(pemasukan - pengeluaran);

    document.getElementById("totalTransactions").textContent =
        transaksi.length;

    document.getElementById("paidTotal").textContent =
        rupiah(pemasukan);

    document.getElementById("chartTotal").textContent =
        rupiah(pengeluaran);
}

function tampilkanTransaksi() {
    const tbody = document.getElementById("transactionRows");
    const search = document.getElementById("search").value.toLowerCase();

    tbody.innerHTML = "";

    const data = transaksi.filter(item =>
        item.nama.toLowerCase().includes(search) ||
        item.kategori.toLowerCase().includes(search)
    ).sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    data.forEach(item => {
        const tr = document.createElement("tr");

        const values = [
            item.nama,
            item.kategori,
            item.tanggal
        ];

        values.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        const jenis = document.createElement("td");
        jenis.textContent =
            item.jenis === "income" ? "Pemasukan" : "Pengeluaran";

        const nominal = document.createElement("td");
        nominal.textContent =
            (item.jenis === "income" ? "+ " : "- ") +
            rupiah(item.nominal);

        nominal.className = item.jenis;

        const aksi = document.createElement("td");
        const hapus = document.createElement("button");

        hapus.textContent = "Hapus";
        hapus.className = "delete";

        hapus.onclick = () => hapusTransaksi(item.id);

        aksi.appendChild(hapus);

        tr.append(jenis, nominal, aksi);
        tbody.appendChild(tr);
    });

    document.getElementById("rowCount").textContent =
        `Menampilkan ${data.length} transaksi`;
}

function tampilkanPembayaran() {
    const tbody = document.getElementById("paymentRows");
    tbody.innerHTML = "";

    const data = transaksi
        .filter(item => item.jenis === "income")
        .slice(-4)
        .reverse();

    data.forEach(item => {
        const tr = document.createElement("tr");

        const nama = document.createElement("td");
        nama.textContent = item.nama;

        const nominal = document.createElement("td");
        nominal.textContent = rupiah(item.nominal);

        const metode = document.createElement("td");
        metode.textContent = item.metode || "Tunai";

        tr.append(nama, nominal, metode);
        tbody.appendChild(tr);
    });
}

function refresh() {
    updateDashboard();
    tampilkanTransaksi();
    tampilkanPembayaran();
}

function hapusTransaksi(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
        transaksi = transaksi.filter(
            item => item.id !== id
        );

        simpanData();
        refresh();
    }
}

function openModal() {
    document.getElementById("modal").classList.add("show");
}

function closeModal() {
    document.getElementById("modal").classList.remove("show");
}

document.getElementById("transactionForm")
    .addEventListener("submit", function(e) {

    e.preventDefault();

    const nama = document.getElementById("description").value.trim();
    const kategori = document.getElementById("category").value;
    const jenis = document.getElementById("type").value;
    const nominal = Number(document.getElementById("amount").value);
    const tanggal = document.getElementById("date").value;

    if (!nama || nominal <= 0 || !tanggal) {
        alert("Mohon isi data dengan benar!");
        return;
    }

    transaksi.push({
        id: Date.now(),
        nama,
        kategori,
        jenis,
        nominal,
        tanggal,
        metode: "Tunai"
    });

    simpanData();
    refresh();

    this.reset();
    closeModal();

    alert("Transaksi berhasil ditambahkan!");
});

document.getElementById("search")
    .addEventListener("input", tampilkanTransaksi);

function exportCSV() {
    if (transaksi.length === 0) {
        alert("Belum ada transaksi!");
        return;
    }

    const data = [
        ["Nama", "Kategori", "Tanggal", "Jenis", "Nominal"],
        ...transaksi.map(item => [
            item.nama,
            item.kategori,
            item.tanggal,
            item.jenis,
            item.nominal
        ])
    ];

    const csv = "\uFEFF" + data.map(row =>
        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
    ).join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "laporan-my-kas.csv";
    link.click();

    URL.revokeObjectURL(url);
}

refresh();
