import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { foodAnalysisAPI } from '../utils/api';

export function ScanScreen({ onScanStart, isDarkMode }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockImages = [
    'https://images.unsplash.com/photo-1642339800099-921df1a0a958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzYzMDA4ODY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1489564239502-7a532064e1c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjMwMzI2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1568158879083-c42860933ed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwY29sb3JmdWx8ZW58MXx8fHwxNzYzMDMxNzcwfDA&ixlib=rb-4.1.0&q=80&w=1080'
  ];

  const handleSelectMockImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setSelectedImageFile(null); // Mock images don't have file
  };

  const handleAnalyze = async () => {
    if (!selectedImageFile && !selectedImage) {
      alert('Please select or capture an image first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      let analysisResult;
      
      if (selectedImageFile) {
        // Real API call with image file
        const result = await foodAnalysisAPI.analyze(selectedImageFile);
        
        // Check if analysis was successful
        if (!result.success && result.error) {
          alert(result.error || 'No food items detected. Please try with a clearer image of food items.');
          setIsAnalyzing(false);
          return;
        }
        
        // Check if any food items were detected
        if (!result.data || !result.data.detectedItems || result.data.detectedItems.length === 0) {
          alert('No food items detected in the image. Please ensure the image contains visible food items.');
          setIsAnalyzing(false);
          return;
        }
        
        analysisResult = result.data;
      } else {
        // Mock API call for sample images
        const result = await foodAnalysisAPI.analyzeMock();
        analysisResult = result.data;
      }

      // Pass both image and analysis result
      onScanStart(selectedImage, analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.message || 'Failed to analyze image';
      
      // Show user-friendly error
      if (errorMessage.includes('No food items detected')) {
        alert('No food items detected in the image. Please try with a clearer image of food items.');
      } else if (errorMessage.includes('Backend server')) {
        alert('Backend server is not running. Please start the server on port 5001.');
      } else {
        alert(`Analysis failed: ${errorMessage}. Please try again.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRescan = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // Create a file input with camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedImageFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImage(event.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-['Poppins'] text-gray-900 dark:text-white mb-3">
            AI Food Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Snap or upload a photo of your meal for instant nutrition analysis
          </p>
        </motion.div>

        {/* Camera Frame Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-2xl mb-6 relative overflow-hidden"
        >
          {/* AI Pulse Animation Background */}
          <AnimatePresence>
            {selectedImage && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 blur-3xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 0.2, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-l from-green-500 to-emerald-500 blur-3xl"
                />
              </>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            {!selectedImage ? (
              /* Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-slate-600 hover:border-orange-400'
                }`}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                <h3 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                  📸 Tap to Scan Your Meal
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Drag and drop an image here, or click to browse
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={handleCameraCapture}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-['Poppins']">Open Camera</span>
                  </button>
                  <label className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all cursor-pointer">
                    <Upload className="w-5 h-5" />
                    <span className="font-['Poppins']">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* Selected Image Preview */
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Selected meal"
                    className="w-full h-96 object-cover"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRescan}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-orange-500 transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-['Poppins']">Re-scan</span>
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-['Poppins']">
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Select Demo Images */}
        {!selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
              Or try with sample images:
            </p>
            <div className="grid grid-cols-3 gap-4">
              {mockImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectMockImage(img)}
                  className="relative rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-orange-500 transition-all group"
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Sample ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white font-['Poppins']">Select</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

