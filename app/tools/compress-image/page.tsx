'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Upload, Download, X, Eye, Trash2, Edit2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface UploadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  selected: boolean;
  dimensions: { width: number; height: number };
}

interface CompressedImage {
  id: string;
  name: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  format: string;
  createdAt: Date;
  blob: Blob;
  preview: string;
}

export default function CompressImage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [quality, setQuality] = useState([80]);
  const [outputFormat, setOutputFormat] = useState('original');
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [newImageName, setNewImageName] = useState('');
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
        const img = new Image();
        img.onload = () => {
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            name: file.name.split('.')[0],
            size: file.size,
            preview: e.target?.result as string,
            selected: true,
            dimensions: { width: img.width, height: img.height }
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        img.src = e.target?.result as string;
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

  const compressImages = async () => {
    const selectedImages = uploadedImages.filter(img => img.selected);
    if (selectedImages.length === 0) return;

    setIsCompressing(true);
    setCompressionProgress(0);

    // Simulate compression progress
    const progressInterval = setInterval(() => {
      setCompressionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate compression process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock compressed images
    for (const image of selectedImages) {
      const compressionRatio = (100 - quality[0]) / 100;
      const compressedSize = Math.floor(image.size * (1 - compressionRatio));
      
      // Create mock compressed blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = image.dimensions;
        
        if (resizeEnabled) {
          const aspectRatio = width / height;
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedImage: CompressedImage = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: image.name,
              originalName: image.file.name,
              originalSize: image.size,
              compressedSize: blob.size,
              compressionRatio: Math.round((1 - blob.size / image.size) * 100),
              quality: quality[0],
              format: outputFormat === 'original' ? image.file.type.split('/')[1] : outputFormat,
              createdAt: new Date(),
              blob,
              preview: canvas.toDataURL()
            };
            
            setCompressedImages(prev => [...prev, compressedImage]);
          }
        }, outputFormat === 'original' ? image.file.type : `image/${outputFormat}`, quality[0] / 100);
      };
      
      img.src = image.preview;
    }

    setIsCompressing(false);
    setCompressionProgress(0);
  };

  const downloadImage = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.name}_compressed.${image.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    compressedImages.forEach(image => {
      setTimeout(() => downloadImage(image), 100);
    });
  };

  const previewImage = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.blob);
    window.open(url, '_blank');
  };

  const startEditingImage = (id: string, currentName: string) => {
    setEditingImageId(id);
    setNewImageName(currentName);
  };

  const saveImageName = (id: string) => {
    setCompressedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, name: newImageName } : img
      )
    );
    setEditingImageId(null);
    setNewImageName('');
  };

  const deleteCompressedImage = (id: string) => {
    setCompressedImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setUploadedImages([]);
  };

  const selectedCount = uploadedImages.filter(img => img.selected).length;
  const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSavings = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Image Compressor</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload & Settings Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <span>Upload Images</span>
                </CardTitle>
                <CardDescription>
                  Compress your images to reduce file size while maintaining quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-purple-500 bg-background' 
                      : 'border-border hover:border-purple-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      Drag & drop images here
                    </p>
                    <p className="text-muted-foreground">or click to browse files</p>
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

                {/* Compression Settings */}
                <Card className="bg-background border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Settings className="w-4 h-4 text-primary" />
                      <span>Compression Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quality: {quality[0]}%</Label>
                        <Slider
                          value={quality}
                          onValueChange={setQuality}
                          max={100}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Higher quality = larger file size</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <Select value={outputFormat} onValueChange={setOutputFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">Keep Original</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="resize"
                          checked={resizeEnabled}
                          onCheckedChange={setResizeEnabled}
                        />
                        <Label htmlFor="resize">Resize images</Label>
                      </div>
                      
                      {resizeEnabled && (
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div className="space-y-2">
                            <Label>Max Width (px)</Label>
                            <Input
                              type="number"
                              value={maxWidth}
                              onChange={(e) => setMaxWidth(Number(e.target.value))}
                              min={100}
                              max={4000}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Height (px)</Label>
                            <Input
                              type="number"
                              value={maxHeight}
                              onChange={(e) => setMaxHeight(Number(e.target.value))}
                              min={100}
                              max={4000}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compressing images...</span>
                      <span>{compressionProgress}%</span>
                    </div>
                    <Progress value={compressionProgress} className="w-full" />
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
                      {uploadedImages.map((image) => (
                        <div key={image.id} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                          image.selected ? 'border-purple-200 bg-background' : 'border-border bg-background'
                        }`}>
                          <Checkbox
                            checked={image.selected}
                            onCheckedChange={() => toggleImageSelection(image.id)}
                          />
                          <div className="flex-shrink-0">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {image.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(image.size / 1024 / 1024).toFixed(2)} MB • {image.dimensions.width}×{image.dimensions.height}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={compressImages}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isCompressing || selectedCount === 0}
                      size="lg"
                    >
                      {isCompressing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      {isCompressing ? 'Compressing...' : `Compress ${selectedCount} Image${selectedCount !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}

                <Alert>
                  <ImageIcon className="h-4 w-4" />
                  <AlertDescription>
                    Supported formats: JPG, PNG, GIF, BMP, WEBP. Maximum file size: 10MB per image.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Compressed Images Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>Compressed Images</span>
                </CardTitle>
                <CardDescription>
                  {compressedImages.length > 0 
                    ? `${compressedImages.length} image${compressedImages.length > 1 ? 's' : ''} compressed`
                    : 'Your compressed images will appear here'
                  }
                </CardDescription>
                {compressedImages.length > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-muted-foreground">
                      Total savings: {totalSavings}%
                    </div>
                    <Button size="sm" onClick={downloadAll}>
                      <Download className="w-3 h-3 mr-1" />
                      Download All
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {compressedImages.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {compressedImages.map((image) => (
                      <div key={image.id} className="p-4 bg-background rounded-lg border">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
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
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-foreground text-sm">{image.name}</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingImage(image.id, image.name)}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {(image.originalSize / 1024 / 1024).toFixed(2)} MB → {(image.compressedSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                  <p className="text-xs text-primary font-medium">
                                    {image.compressionRatio}% smaller
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => downloadImage(image)}
                              className="flex-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewImage(image)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCompressedImage(image.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No images compressed yet</p>
                    <p className="text-sm">Upload and compress images to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            {compressedImages.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Compression Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Images processed:</span>
                      <span className="font-medium">{compressedImages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Original size:</span>
                      <span className="font-medium">{(totalOriginalSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compressed size:</span>
                      <span className="font-medium">{(totalCompressedSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total savings:</span>
                      <span className="font-bold text-primary">{totalSavings}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}