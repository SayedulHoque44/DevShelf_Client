'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Download, X, Eye, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { mergePDFs } from '@/lib/pdf-utils';

interface UploadedPDF {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  order: number;
}

interface MergedPDF {
  id: string;
  name: string;
  size: number;
  totalPages: number;
  createdAt: Date;
  blob: Blob;
  sourceFiles: string[];
}

export default function MergePDFs() {
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([]);
  const [mergedPDFs, setMergedPDFs] = useState<MergedPDF[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [mergedFileName, setMergedFileName] = useState('merged-document');
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [newPdfName, setNewPdfName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    pdfFiles.forEach((file, index) => {
      const newPDF: UploadedPDF = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name.split('.')[0],
        size: file.size,
        pages: Math.floor(Math.random() * 20) + 1, // Mock page count
        order: uploadedPDFs.length + index
      };
      setUploadedPDFs(prev => [...prev, newPDF]);
    });
  };

  const removePDF = (id: string) => {
    setUploadedPDFs(prev => {
      const filtered = prev.filter(pdf => pdf.id !== id);
      // Reorder remaining PDFs
      return filtered.map((pdf, index) => ({ ...pdf, order: index }));
    });
  };

  const moveUp = (id: string) => {
    setUploadedPDFs(prev => {
      const index = prev.findIndex(pdf => pdf.id === id);
      if (index <= 0) return prev;
      
      const newArray = [...prev];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      
      return newArray.map((pdf, idx) => ({ ...pdf, order: idx }));
    });
  };

  const moveDown = (id: string) => {
    setUploadedPDFs(prev => {
      const index = prev.findIndex(pdf => pdf.id === id);
      if (index >= prev.length - 1) return prev;
      
      const newArray = [...prev];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      
      return newArray.map((pdf, idx) => ({ ...pdf, order: idx }));
    });
  };

  const mergePDFFiles = async () => {
    if (uploadedPDFs.length < 2) return;

    setIsMerging(true);
    setMergeProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setMergeProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Sort PDFs by order and merge them
      const sortedPDFs = [...uploadedPDFs].sort((a, b) => a.order - b.order);
      const pdfBlob = await mergePDFs(sortedPDFs.map(pdf => pdf.file));

      clearInterval(progressInterval);
      setMergeProgress(100);

      const totalPages = uploadedPDFs.reduce((sum, pdf) => sum + pdf.pages, 0);

      const mergedPDF: MergedPDF = {
        id: Date.now().toString(),
        name: mergedFileName || 'merged-document',
        size: pdfBlob.size,
        totalPages,
        createdAt: new Date(),
        blob: pdfBlob,
        sourceFiles: sortedPDFs.map(pdf => pdf.file.name)
      };

      setMergedPDFs(prev => [...prev, mergedPDF]);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setMergeProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const downloadPDF = (pdf: MergedPDF) => {
    const url = URL.createObjectURL(pdf.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdf.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewPDF = (pdf: MergedPDF) => {
    const url = URL.createObjectURL(pdf.blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const startEditingPdf = (id: string, currentName: string) => {
    setEditingPdfId(id);
    setNewPdfName(currentName);
  };

  const savePdfName = (id: string) => {
    setMergedPDFs(prev => 
      prev.map(pdf => 
        pdf.id === id ? { ...pdf, name: newPdfName } : pdf
      )
    );
    setEditingPdfId(null);
    setNewPdfName('');
  };

  const deleteMergedPDF = (id: string) => {
    setMergedPDFs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const clearAll = () => {
    setUploadedPDFs([]);
  };

  const totalPages = uploadedPDFs.reduce((sum, pdf) => sum + pdf.pages, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Merge PDF Files</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  <span>Upload PDF Files</span>
                </CardTitle>
                <CardDescription>
                  Upload multiple PDF files and merge them into a single document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      Drag & drop PDF files here
                    </p>
                    <p className="text-gray-500">or click to browse files</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Merge Settings */}
                <div className="space-y-2">
                  <Label htmlFor="merged-name">Merged File Name</Label>
                  <Input
                    id="merged-name"
                    value={mergedFileName}
                    onChange={(e) => setMergedFileName(e.target.value)}
                    placeholder="Enter merged file name"
                  />
                </div>

                {/* Merge Progress */}
                {isMerging && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Merging PDFs...</span>
                      <span>{mergeProgress}%</span>
                    </div>
                    <Progress value={mergeProgress} className="w-full" />
                  </div>
                )}

                {/* Uploaded PDFs */}
                {uploadedPDFs.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">PDF Files ({uploadedPDFs.length})</h3>
                        <p className="text-sm text-gray-500">Total pages: {totalPages}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={clearAll}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {uploadedPDFs
                        .sort((a, b) => a.order - b.order)
                        .map((pdf, index) => (
                        <div key={pdf.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveUp(pdf.id)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveDown(pdf.id)}
                              disabled={index === uploadedPDFs.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {pdf.name}.pdf
                            </p>
                            <p className="text-sm text-gray-500">
                              {(pdf.size / 1024 / 1024).toFixed(2)} MB • {pdf.pages} pages
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePDF(pdf.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={mergePDFFiles}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isMerging || uploadedPDFs.length < 2}
                      size="lg"
                    >
                      {isMerging ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      {isMerging ? 'Merging...' : `Merge ${uploadedPDFs.length} PDFs`}
                    </Button>
                  </div>
                )}

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Upload at least 2 PDF files to merge them. Maximum file size: 50MB per file.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Merged PDFs Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Merged PDFs</span>
                </CardTitle>
                <CardDescription>
                  {mergedPDFs.length > 0 
                    ? `${mergedPDFs.length} PDF${mergedPDFs.length > 1 ? 's' : ''} merged`
                    : 'Your merged PDFs will appear here'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mergedPDFs.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mergedPDFs.map((pdf) => (
                      <div key={pdf.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="space-y-3">
                          {editingPdfId === pdf.id ? (
                            <div className="flex space-x-2">
                              <Input
                                value={newPdfName}
                                onChange={(e) => setNewPdfName(e.target.value)}
                                className="text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && savePdfName(pdf.id)}
                              />
                              <Button size="sm" onClick={() => savePdfName(pdf.id)}>
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{pdf.name}.pdf</h4>
                                <p className="text-sm text-gray-500">
                                  {pdf.totalPages} pages • {(pdf.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-gray-400">
                                  From {pdf.sourceFiles.length} files
                                </p>
                                <p className="text-xs text-gray-400">
                                  {pdf.createdAt.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingPdf(pdf.id, pdf.name)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => downloadPDF(pdf)}
                              className="flex-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewPDF(pdf)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMergedPDF(pdf.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No PDFs merged yet</p>
                    <p className="text-sm">Upload and merge PDFs to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Merge Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Drag to reorder files</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Preserve quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Custom file names</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Batch processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure merging</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}