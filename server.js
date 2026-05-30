import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = Number(process.env.PORT || 4000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'ElitePower2024!';
const API_ROOT = '/api';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use(`${API_ROOT}/uploads`, express.static(UPLOAD_DIR));

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const registrationSchema = z.object({
  nom: z.string().min(1).regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/),
  prenom: z.string().min(1).regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/),
  ddn: z.string().refine(value => !Number.isNaN(new Date(value).getTime()), { message: 'Date invalide' }),
  lieuNaissance: z.string().min(1).regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/),
  tel: z.string().min(8).max(20).regex(/^\+?[0-9 ]+$/),
  categorie: z.string().min(1),
  region: z.string().min(1),
  ville: z.string().min(1).regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/),
club: z.string().optional().nullable(),
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${timestamp}-${safeName}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf');
  }
});

function requireAdminToken(req, res, next) {
  const token = req.header('x-admin-token');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

app.post(`${API_ROOT}/register`, upload.single('pdf'), async (req, res) => {
  try {
    const payload = registrationSchema.parse({
  nom: req.body.nom         || undefined,
  prenom: req.body.prenom   || undefined,
  ddn: req.body.ddn         || undefined,
  lieuNaissance: req.body.lieu_naissance || undefined,
  tel: req.body.tel         || undefined,
  categorie: req.body.categorie || undefined,
  region: req.body.region   || undefined,
  ville: req.body.ville     || undefined,
  club: req.body.club       || undefined,
});
    let pdfPath = null;
    let pdfName = null;

    if (req.file) {
      pdfPath = path.join('uploads', req.file.filename);
      pdfName = req.file.originalname;
    }

    const ref = `EC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const registration = await prisma.registration.create({
      data: {
        ref,
        nom: payload.nom.toUpperCase(),
        prenom: payload.prenom,
        ddn: new Date(payload.ddn),
        lieuNaissance: payload.lieuNaissance,
        tel: payload.tel,
        categorie: payload.categorie,
        region: payload.region,
        ville: payload.ville,
        club: payload.club,
        pdfPath,
        pdfName,
      }
    });

    return res.status(201).json({ ref: registration.ref });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }

    if (req.file && req.file.path && error) {
      try { fs.unlinkSync(req.file.path); } catch {};
    }

    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

app.get(`${API_ROOT}/stats`, async (req, res) => {
  const total = await prisma.registration.count();
  res.json({ total });
});

app.get(`${API_ROOT}/registrations`, requireAdminToken, async (req, res) => {
  const registrations = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(registrations.map(r => ({
    ...r,
    ddn: r.ddn.toISOString().split('T')[0],
    pdfUrl: r.pdfPath ? `${req.protocol}://${req.get('host')}${API_ROOT}/${r.id}/pdf` : null,
  })));
});

app.get(`${API_ROOT}/registrations/:id/pdf`, requireAdminToken, async (req, res) => {
  const id = Number(req.params.id);
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration || !registration.pdfPath) {
    return res.status(404).json({ error: 'Dossier médical introuvable' });
  }
  const pdfFile = path.join(__dirname, registration.pdfPath);
  res.download(pdfFile, registration.pdfName);
});

app.delete(`${API_ROOT}/registrations/:id`, requireAdminToken, async (req, res) => {
  const id = Number(req.params.id);
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    return res.status(404).json({ error: 'Inscription introuvable' });
  }

  if (registration.pdfPath) {
    try { fs.unlinkSync(path.join(__dirname, registration.pdfPath)); } catch {};
  }

  await prisma.registration.delete({ where: { id } });
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('DB ping OK');
  } catch(e) {
    console.log('DB ping failed:', e.message);
  }
}, 10 * 60 * 1000); // toutes les 10 minutes

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
