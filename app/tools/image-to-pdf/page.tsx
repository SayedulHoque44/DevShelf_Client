'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileImage, FileText, Upload, Download, X, Edit2, Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { createPDFFromImages, PDFOptions } from '@/lib/pdf-utils';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  selected: boolean;
  name: string;
}

interface GeneratedPDF {
  id: string;
  name: string;
  size: number;
  createdAt: Date;
  imageCount: number;
  blob: Blob;
}

export default function ImageToPDF() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [pdfName, setPdfName] = useState('converted-images');
  const [pageSize, setPageSize] = useState<'A4' | 'A3' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [newImageName, setNewImageName] = useState('');
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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview: e.target?.result as string,
          selected: true,
          name: file.name.split('.')[0]
        };
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleImageSelection = (id: string) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const selectAllImages = () => {
    setUploadedImages(prev => prev.map(img => ({ ...img, selected: true })));
  };

  const deselectAllImages = () => {
    setUploadedImages(prev => prev.map(img => ({ ...img, selected: false })));
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const startEditingImage = (id: string, currentName: string) => {
    setEditingImageId(id);
    setNewImageName(currentName);
  };

  const saveImageName = (id: string) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, name: newImageName } : img
      )
    );
    setEditingImageId(null);
    setNewImageName('');
  };

  const startEditingPdf = (id: string, currentName: string) => {
    setEditingPdfId(id);
    setNewPdfName(currentName);
  };

  const savePdfName = (id: string) => {
    setGeneratedPDFs(prev => 
      prev.map(pdf => 
        pdf.id === id ? { ...pdf, name: newPdfName } : pdf
      )
    );
    setEditingPdfId(null);
    setNewPdfName('');
  };

  const deletePdf = (id: string) => {
    setGeneratedPDFs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const convertToPDF = async () => {
    const selectedImages = uploadedImages.filter(img => img.selected);
    if (selectedImages.length === 0) return;
    
    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create PDF options
      const options: PDFOptions = {
        pageSize,
        orientation,
        margin: 50
      };

      // Convert images to PDF
      const pdfBlob = await createPDFFromImages(
        selectedImages.map(img => ({ file: img.file, name: img.name })),
        options
      );

      clearInterval(progressInterval);
      setConversionProgress(100);

      const newPdf: GeneratedPDF = {
        id: Date.now().toString(),
        name: pdfName || 'converted-images',
        size: pdfBlob.size,
        createdAt: new Date(),
        imageCount: selectedImages.length,
        blob: pdfBlob
      };
      
      setGeneratedPDFs(prev => [...prev, newPdf]);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setConversionProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('Error converting images to PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPdf = (pdf: GeneratedPDF) => {
    const url = URL.createObjectURL(pdf.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdf.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewPdf = (pdf: GeneratedPDF) => {
    const url = URL.createObjectURL(pdf.blob);
    window.open(url, '_blank');
    // Clean up the URL after a delay to allow the browser to load it
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearAll = () => {
    setUploadedImages([]);
  };

  const selectedCount = uploadedImages.filter(img => img.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FileImage className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-semibold text-gray-900">Image to PDF Converter</h1>
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
                  <Upload className="w-5 h-5 text-orange-600" />
                  <span>Upload Images</span>
                </CardTitle>
                <CardDescription>
                  Upload multiple images and convert them into a professional PDF document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300 hover:border-orange-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      Drag & drop images here
                    </p>
                    <p className="text-gray-500">or click to browse files</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* PDF Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pdf-name">PDF Name</Label>
                    <Input
                      id="pdf-name"
                      value={pdfName}
                      onChange={(e) => setPdfName(e.target.value)}
                      placeholder="Enter PDF name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select value={pageSize} onValueChange={(value: 'A4' | 'A3' | 'Letter' | 'Legal') => setPageSize(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select value={orientation} onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conversion Progress */}
                {isConverting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Converting images to PDF...</span>
                      <span>{conversionProgress}%</span>
                    </div>
                    <Progress value={conversionProgress} className="w-full" />
                  </div>
                )}

                {/* Image Management */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          {selectedCount} of {uploadedImages.length} selected
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={selectAllImages}>
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={deselectAllImages}>
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={clearAll}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {uploadedImages.map((image, index) => (
                        <div key={image.id} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                          image.selected ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <Checkbox
                            checked={image.selected}
                            onCheckedChange={() => toggleImageSelection(image.id)}
                          />
                          <div className="flex-shrink-0">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingImageId === image.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={newImageName}
                                  onChange={(e) => setNewImageName(e.target.value)}
                                  className="text-sm"
                                  onKeyPress={(e) => e.key === 'Enter' && saveImageName(image.id)}
                                />
                                <Button size="sm" onClick={() => saveImageName(image.id)}>
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {image.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingImage(image.id, image.name)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(image.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Convert Button */}
                <Button 
                  onClick={convertToPDF}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  disabled={isConverting || selectedCount === 0}
                  size="lg"
                >
                  {isConverting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {isConverting ? 'Converting...' : `Convert ${selectedCount} Image${selectedCount !== 1 ? 's' : ''} to PDF`}
                </Button>

                <Alert>
                  <FileImage className="h-4 w-4" />
                  <AlertDescription>
                    Supported formats: JPG, PNG, GIF, BMP, WEBP. Maximum file size: 10MB per image.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Generated PDFs Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span>Generated PDFs</span>
                </CardTitle>
                <CardDescription>
                  {generatedPDFs.length > 0 
                    ? `${generatedPDFs.length} PDF${generatedPDFs.length > 1 ? 's' : ''} generated`
                    : 'Your converted PDFs will appear here'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedPDFs.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedPDFs.map((pdf) => (
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
                                  {pdf.imageCount} images • {(pdf.size / 1024 / 1024).toFixed(2)} MB
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
                              onClick={() => downloadPdf(pdf)}
                              className="flex-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewPdf(pdf)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePdf(pdf.id)}
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
                    <p>No PDFs generated yet</p>
                    <p className="text-sm">Convert images to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Multiple image formats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Batch conversion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Custom page sizes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Image selection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>PDF management</span>
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