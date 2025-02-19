---
title: "Javascript bagian 2"
date: 2025-02-19T23:25:00+07:00
last_modified: 2025-02-19T23:25:00+07:00
description: "Catatan belajar JavaScript bagian 2"
excerpt: "Catatan belajar atau ringkasan tentang JavaScript bagian 2."
categories:
  - Programing
  - Javascript
tags:
  - programming
  - javascript
  - belajar_javascript
  - catatan_belajar
  - javascript_pemula
  - belajar_programming
  - web_development
  - front_end
thumbnail: 
pinned: false
draft: false
mathjax: false
---
## Tipe Data di JavaScript
Tipe data adalah jenis nilai yang bisa disimpan di variabel. Di JavaScript, ada beberapa tipe data utama:
- String (teks)
Teks harus diapit oleh tanda kutip (" " atau ' ').
```javascript
let nama = "Budi";
console.log(nama); // Output: Budi
```
- Number (angka)
Bisa berupa bilangan bulat atau desimal.
```javascript
let umur = 25;
let berat = 60.5;
console.log(umur, berat); // Output: 25 60.5
```
- Boolean (benar/salah)
Hanya memiliki dua nilai: true atau false.
```javascript
let sudahMakan = true;
console.log(sudahMakan); // Output: true
```
- Undefined (tidak ada nilai)
Variabel dibuat tetapi belum diberi nilai.
```javascript
let alamat;
console.log(alamat); // Output: undefined
```
- Null (kosong)
Variabel memiliki nilai kosong (sengaja dibuat kosong).
```javascript
let data = null;
console.log(data); // Output: null
```

---

## Operator di JavaScript
Operator digunakan untuk melakukan operasi pada nilai atau variabel.
- Operator Aritmatika (untuk perhitungan)
Contoh:
```javascript
let a = 10;
let b = 3;
console.log(a + b); // Output: 13
console.log(a % b); // Output: 1
```
- Operator Perbandingan (hasilnya true atau false)
Contoh:
```javascript
let angka = 10;
console.log(angka == "10");  // true (tidak cek tipe)
console.log(angka === "10"); // false (cek tipe)
```
- Operator Logika (digunakan dalam kondisi if)
Contoh:
```javascript
let umur = 20;
console.log(umur > 18 && umur < 30); // true
console.log(umur < 18 || umur > 25); // false
console.log(!true); // false
```

---

## Latihan Singkat

Coba jalankan di browser atau console:
```javascript
let angka = prompt("Masukkan angka:");
if (angka % 2 == 0) {
    alert("Angka genap!");
} else {
    alert("Angka ganjil!");
}
```
Kode ini mengecek apakah angka yang dimasukkan genap atau ganjil.