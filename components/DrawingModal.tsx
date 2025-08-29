

import React, { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { TextIcon, ClipboardIcon } from './Icons';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

interface TextObject {
  id: string;
  text: string;
  x: number;
  y: number;
  font: string;
  size: number;
  color: string;
}

const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
const fontSizes = [12, 16, 20, 24, 32, 48];

const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  
  // New states for text and tool management
  const [isErasing, setIsErasing] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [texts, setTexts] = useState<TextObject[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);

  if (!isOpen) return null;

  const generateFinalImage = async (): Promise<string> => {
      if (!canvasRef.current) return '';
      const sketchDataUrl = await canvasRef.current.exportImage('png');
      
      const canvasElement = canvasRef.current.getCanvas();
      const { width, height } = canvasElement;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return '';

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          texts.forEach(text => {
            ctx.font = `${text.size}px ${text.font}`;
            ctx.fillStyle = text.color;
            ctx.textBaseline = 'top'; // Align text from top-left
            ctx.fillText(text.text, text.x, text.y);
          });
          resolve(finalCanvas.toDataURL('image/png'));
        };
        img.src = sketchDataUrl;
      });
    };

  const handleSave = async () => {
    const dataUrl = await generateFinalImage();
    onSave(dataUrl);
  };
  
  const handleCopy = async () => {
    try {
        const dataUrl = await generateFinalImage();
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        alert('Đã sao chép ảnh vào clipboard!');
    } catch(err) {
        console.error("Failed to copy image: ", err);
        alert('Không thể sao chép ảnh.');
    }
  };

  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => {
      canvasRef.current?.clearCanvas();
      setTexts([]);
  };

  const handleEraserToggle = () => {
    const nextErasingState = !isErasing;
    setIsErasing(nextErasingState);
    canvasRef.current?.eraseMode(nextErasingState);
    if (nextErasingState) {
        setIsTextMode(false);
    }
  };
  
  const handleTextModeToggle = () => {
    const newMode = !isTextMode;
    setIsTextMode(newMode);
    if (newMode) {
        setIsErasing(false);
        canvasRef.current?.eraseMode(false);
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTextMode && currentText) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTexts(prev => [...prev, {
            id: crypto.randomUUID(),
            text: currentText,
            x, y, font,
            size: fontSize,
            color: strokeColor,
        }]);
        setCurrentText(''); // Clear input after placing
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-4 md:p-6 w-11/12 md:w-3/4 lg:w-2/3 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Vẽ phác thảo</h2>
        
        <div className="flex flex-col gap-2 mb-4 p-2 border rounded-md">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Drawing Tools */}
                <div className="flex items-center gap-2"><label className="text-sm font-medium">Màu:</label><input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8"/></div>
                <div className="flex items-center gap-2"><label className="text-sm font-medium">Nét:</label><input type="range" min="1" max="20" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="w-24" /><span>{strokeWidth}px</span></div>
                <button onClick={handleEraserToggle} className={`px-3 py-1 text-sm rounded ${isErasing ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tẩy</button>
                <button onClick={handleTextModeToggle} className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${isTextMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}><TextIcon className="w-4 h-4" />Chữ</button>
                <button onClick={handleUndo} className="px-3 py-1 text-sm bg-gray-200 rounded">Hoàn tác</button>
                <button onClick={handleRedo} className="px-3 py-1 text-sm bg-gray-200 rounded">Làm lại</button>
                <button onClick={handleClear} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Xóa hết</button>
            </div>
             {isTextMode && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t mt-2">
                    <input type="text" placeholder="Nhập chữ..." value={currentText} onChange={e => setCurrentText(e.target.value)} className="p-1 border rounded-md" />
                    {/* FIX: Removed invalid _optgroup tag. Options should be direct children of select. */}
                    <div className="flex items-center gap-2"><label className="text-sm">Font:</label><select value={font} onChange={e => setFont(e.target.value)} className="p-1 border rounded-md text-sm">{fonts.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                    {/* FIX: Removed invalid _optgroup tag. Options should be direct children of select. */}
                    <div className="flex items-center gap-2"><label className="text-sm">Cỡ:</label><select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="p-1 border rounded-md text-sm">{fontSizes.map(s => <option key={s} value={s}>{s}px</option>)}</select></div>
                </div>
            )}
        </div>
        
        <div className="relative border border-gray-400 rounded-md overflow-hidden" style={{ height: '50vh', cursor: isTextMode ? 'text' : 'crosshair' }} onClick={handleCanvasClick}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            width="100%"
            height="100%"
            canvasColor="white"
          />
           {texts.map(text => (
            <div key={text.id} style={{
                position: 'absolute', left: text.x, top: text.y,
                fontFamily: text.font, fontSize: `${text.size}px`, color: text.color,
                pointerEvents: 'none', whiteSpace: 'pre-wrap', lineHeight: 1.2
            }}>
                {text.text}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Hủy
          </button>
           <button onClick={handleCopy} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
             <ClipboardIcon className="w-5 h-5" /> Copy ảnh
          </button>
          <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Lưu bản vẽ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingModal;