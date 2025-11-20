const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure temp directories exist
const UPLOAD_DIR = path.join(__dirname, 'temp', 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'temp', 'outputs');
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(OUTPUT_DIR);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Helper to run PowerShell script (Windows)
const convertWithPowerShell = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const psScript = path.join(__dirname, 'convert.ps1');
    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', psScript,
      '-inputFile', inputPath,
      '-outputFile', outputPath
    ]);

    let stderr = '';

    ps.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ps.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`PowerShell script failed with code ${code}: ${stderr}`));
      }
    });
  });
};

// Helper to use LibreOffice (Linux/Docker)
const libre = require('libreoffice-convert');
const { promisify } = require('util');
const convertAsync = promisify(libre.convert);

const convertWithLibreOffice = async (inputPath, outputPath) => {
  const fileBuffer = await fs.readFile(inputPath);
  const pdfBuffer = await convertAsync(fileBuffer, '.pdf', undefined);
  await fs.writeFile(outputPath, pdfBuffer);
};

// Conversion Endpoint
app.post('/api/convert', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (const file of req.files) {
      const inputPath = file.path;
      // Use absolute paths for PowerShell
      const absoluteInputPath = path.resolve(inputPath);
      const outputFilename = path.parse(file.originalname).name + '.pdf';
      const absoluteOutputPath = path.join(OUTPUT_DIR, outputFilename);

      // Convert
      if (process.platform === 'win32') {
        // Windows: Use PowerShell (Native PowerPoint)
        await convertWithPowerShell(absoluteInputPath, absoluteOutputPath);
      } else {
        // Linux/Mac/Docker: Use LibreOffice
        await convertWithLibreOffice(inputPath, absoluteOutputPath);
      }

      // Cleanup input
      await fs.remove(inputPath);

      results.push({
        originalName: file.originalname,
        downloadUrl: `/api/download/${outputFilename}`,
        filename: outputFilename
      });
    }

    res.json({ success: true, files: results });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed', details: error.message });
  }
});

// Download Endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
