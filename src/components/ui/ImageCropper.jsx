import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Check, RotateCcw } from 'lucide-react';
import { getCroppedBlob } from '../../utils/cropImage';

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
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px',
          background: 'var(--card-bg)', borderRadius: '18px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--divider)',
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Adjust {label}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              Drag to reposition · scroll or pinch to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '30px', height: '30px', borderRadius: '50%',
              border: 'none', background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Crop area */}
        <div style={{
          position: 'relative',
          height: aspect >= 2 ? '220px' : '320px',
          background: '#1a1a2e',
        }}>
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
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Zoom slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ZoomOut size={15} color="var(--text-muted)" />
            <input
              type="range"
              min={1} max={3} step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                flex: 1, accentColor: 'var(--accent)', height: '4px', cursor: 'pointer',
              }}
            />
            <ZoomIn size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotation slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={14} color="var(--text-muted)" />
            <input
              type="range"
              min={-45} max={45} step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent)', height: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
              {rotation > 0 ? `+${rotation}` : rotation}°
            </span>
            <button
              onClick={() => setRotation(0)}
              disabled={rotation === 0}
              style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', cursor: rotation === 0 ? 'default' : 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '9px 18px', borderRadius: '9px',
                border: '1.5px solid var(--border)', background: 'transparent',
                fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleApply}
              disabled={applying}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 22px', borderRadius: '9px', border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontSize: '13px', fontWeight: '600',
                cursor: applying ? 'not-allowed' : 'pointer',
                opacity: applying ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Check size={14} />
              {applying ? 'Applying…' : 'Apply & Upload'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
