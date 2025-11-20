import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType, X, ArrowRight, Download, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function App() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setConvertedFiles([]); // Reset converted if new files added
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setConverting(true);
    setError(null);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setConvertedFiles(response.data.files);
      }
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please ensure the backend is running and LibreOffice is installed.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Convert POWERPOINT to PDF
          </h1>
          <p className="text-xl text-slate-600">
            Make PPT and PPTX slideshows easy to view by converting them to PDF.
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-3xl mx-auto">
          {files.length === 0 ? (
            <div
              {...getRootProps()}
              className={clsx(
                "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                isDragActive ? "border-brand-red bg-red-50" : "border-slate-300 hover:border-brand-red hover:bg-slate-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="bg-brand-red text-white p-6 rounded-full mb-6 shadow-xl shadow-red-200">
                <FileType className="h-12 w-12" />
              </div>
              <button className="bg-brand-red text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Select POWERPOINT files
              </button>
              <p className="mt-4 text-slate-500">or drop POWERPOINT slideshows here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-slate-700">Selected Files ({files.length})</h2>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={file.name + index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <FileType className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      {!converting && convertedFiles.length === 0 && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      {convertedFiles.length > 0 && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                {convertedFiles.length === 0 ? (
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="flex items-center gap-3 bg-brand-red text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {converting ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        Convert to PDF
                        <ArrowRight className="h-6 w-6" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Conversion Complete!
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {convertedFiles.map((file, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:5000${file.downloadUrl}`}
                          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md"
                          download
                        >
                          <Download className="h-5 w-5" />
                          Download {file.originalName.replace(/\.[^/.]+$/, "")}.pdf
                        </a>
                      ))}
                    </div>
                    <button
                      onClick={() => { setFiles([]); setConvertedFiles([]); }}
                      className="mt-4 text-slate-500 hover:text-slate-700 underline"
                    >
                      Convert more files
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
              <X className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 iLovePDF Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
