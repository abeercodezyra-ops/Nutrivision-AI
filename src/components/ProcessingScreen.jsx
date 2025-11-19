import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProcessingScreen({ imageUrl, isDarkMode }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const processingSteps = [
    'Detecting food items...',
    'Analyzing ingredients...',
    'Calculating nutrition...',
    'Generating insights...'
  ];

  const currentStep = Math.floor((progress / 100) * processingSteps.length);

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Wave Background */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.5, 1, 1.5],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-l from-green-500/20 to-emerald-500/20 blur-3xl"
          />

          <div className="relative z-10">
            {/* Image Preview with Glow */}
            <div className="relative mb-8">
              <div className="relative rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src={imageUrl}
                  alt="Processing meal"
                  className="w-full h-80 object-cover"
                />
                
                {/* AI Scanning Overlay */}
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                  style={{ boxShadow: '0 0 20px rgba(247, 151, 30, 0.8)' }}
                />

                {/* Corner Scanners */}
                {[
                  { top: '10px', left: '10px', rotate: 0 },
                  { top: '10px', right: '10px', rotate: 90 },
                  { bottom: '10px', right: '10px', rotate: 180 },
                  { bottom: '10px', left: '10px', rotate: 270 }
                ].map((pos, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="absolute w-8 h-8 border-t-4 border-l-4 border-orange-500"
                    style={{ ...pos, transform: `rotate(${pos.rotate}deg)` }}
                  />
                ))}
              </div>

              {/* AI Pulse Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                className="absolute inset-0 border-4 border-orange-500 rounded-2xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.5
                }}
                className="absolute inset-0 border-4 border-yellow-500 rounded-2xl"
              />
            </div>

            {/* Processing Status */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="font-['Poppins'] text-gray-900 dark:text-white mb-2">
                Analyzing your meal...
              </h2>
              <p className="font-['Roboto_Mono'] text-orange-500 mb-4">
                {progress}%
              </p>

              {/* Progress Bar */}
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full relative overflow-hidden"
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>

              {/* Current Step */}
              <p className="text-gray-600 dark:text-gray-300">
                {processingSteps[Math.min(currentStep, processingSteps.length - 1)]}
              </p>
            </div>

            {/* Shimmer Loading Skeletons */}
            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl relative overflow-hidden"
                >
                  <motion.div
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: index * 0.3
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-500/20 to-transparent"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-gray-600 dark:text-gray-300"
        >
          <p className="mb-1">💡 Did you know?</p>
          <p>Our AI can recognize over 10,000 different food items!</p>
        </motion.div>
      </div>
    </div>
  );
}

