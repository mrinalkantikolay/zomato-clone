import { Loader2 } from 'lucide-react';

/**
 * Loader — Reusable loading spinner
 * 
 * Props:
 *   size - Size in pixels (default: 24)
 *   text - Optional loading text
 *   fullScreen - Cover entire viewport
 */
const Loader = ({ size = 24, text, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-primary" />
          {text && <p className="text-text-secondary text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 size={size} className="animate-spin text-primary" />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );
};

export default Loader;
