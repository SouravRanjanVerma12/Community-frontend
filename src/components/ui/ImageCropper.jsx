import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Check, RotateCcw } from 'lucide-react';
import { getCroppedBlob } from '../../utils/cropImage';
import Button from './Button';

export default function ImageCropper({ file, aspect, shape, label, onComplete, onCancel }) {
  const [crop, setCrop]               = useState({ x: 0, y: 0 });
  const [zoom, setZoom]               = useState(1);
  const [rotation, setRotation]       = useState(0);
  const [croppedArea, setCroppedArea] = useState(null);
  const [applying, setApplying]       = useState(false);

  const src = file ? URL.createObjectURL(file) : null;

  const onCropComplete = useCallback((_, pixels) => {
    if (pixels?.width > 0) setCroppedArea(pixels);
  }, []);

  const handleApply = async () => {
    if (!src) return;
    const area = croppedArea ?? { x: 0, y: 0, width: 200, height: Math.round(200 / aspect) };
    setApplying(true);
    try {
      const blob = await getCroppedBlob(src, area, shape);
      onComplete(blob);
    } finally {
      setApplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 z-300 bg-black/70 backdrop-blur-md flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] bg-card rounded-[18px] shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <div>
            <h3 className="text-[15px] font-bold text-text-primary m-0">
              Adjust {label}
            </h3>
            <p className="text-xs text-text-muted m-0 mt-0.5">
              Drag to reposition · scroll or pinch to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-[30px] h-[30px] rounded-full border-none bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary"
          >
            <X size={15} />
          </button>
        </div>

        {/* Crop area */}
        <div className={`relative bg-[#1a1a2e] ${aspect >= 2 ? 'h-[220px]' : 'h-[320px]'}`}>
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={shape === 'round' ? 'round' : 'rect'}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: 0 },
                cropAreaStyle: {
                  border: '2px solid rgba(124,58,237,0.8)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                },
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex flex-col gap-3.5">
          {/* Zoom slider */}
          <div className="flex items-center gap-2.5">
            <ZoomOut size={15} color="var(--text-muted)" />
            <input
              type="range"
              min={1} max={3} step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-accent h-1 cursor-pointer"
            />
            <ZoomIn size={15} color="var(--text-muted)" />
            <span className="text-xs text-text-muted min-w-9 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotation slider */}
          <div className="flex items-center gap-2.5">
            <RotateCcw size={14} color="var(--text-muted)" />
            <input
              type="range"
              min={-45} max={45} step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 accent-accent h-1 cursor-pointer"
            />
            <span className="text-xs text-text-muted min-w-9 text-right">
              {rotation > 0 ? `+${rotation}` : rotation}°
            </span>
            <button
              onClick={() => setRotation(0)}
              disabled={rotation === 0}
              className={`text-[11px] px-2 py-[3px] rounded-[5px] border border-border bg-transparent text-text-muted ${rotation === 0 ? 'cursor-default' : 'cursor-pointer'}`}
            >
              Reset
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply} disabled={applying}>
              <Check size={14} />
              {applying ? 'Applying…' : 'Apply & Upload'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
