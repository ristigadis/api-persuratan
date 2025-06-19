const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Logging awal untuk memastikan kode berjalan
console.log('🚀 Memulai API Persuratan...');

app.use(cors());
app.use(express.json());

// ✅ KONEKSI DATABASE RAILWAY
const pool = new Pool({
  connectionString: 'postgresql://postgres:NwCWgxLUaCHlpSEmMLwYtelXdmtkoQoV@trolley.proxy.rlwy.net:57176/railway',
  ssl: { rejectUnauthorized: false },
});

// ✅ ROUTE UTAMA (untuk menghindari error di root URL)
app.get('/', (req, res) => {
  res.send('✅ API Persuratan aktif dan siap digunakan!');
});

// 📄 GET Semua Surat
app.get('/surat', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surat ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ GET /surat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📩 POST Kirim Surat Baru
app.post('/surat', async (req, res) => {
  try {
    const { kategori, nama, nim, tanggal_lahir, tujuan } = req.body;
    const result = await pool.query(
      `INSERT INTO surat(kategori, nama, nim, tanggal_lahir, tujuan, status)
       VALUES($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [kategori, nama, nim, tanggal_lahir, tujuan]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ POST /surat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📢 POST Tambah Pengumuman
app.post('/pengumuman', async (req, res) => {
  try {
    const { judul, isi } = req.body;
    const result = await pool.query(
      'INSERT INTO pengumuman(judul, isi) VALUES($1, $2) RETURNING *',
      [judul, isi]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ POST /pengumuman error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📋 GET Semua Pengumuman
app.get('/pengumuman', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pengumuman ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ GET /pengumuman error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ DELETE Pengumuman
app.delete('/pengumuman/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pengumuman WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /pengumuman error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ JALANKAN SERVER
app.listen(port, () => {
  console.log(`✅ API Persuratan aktif di http://localhost:${port}`);
});
