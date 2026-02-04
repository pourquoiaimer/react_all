import React, { useState, useRef, useEffect } from 'react';
import Sortable from 'sortablejs';

// LINE 貼圖標準尺寸
const STICKER_WIDTH = 370;
const STICKER_HEIGHT = 320;
const ASPECT_RATIO = STICKER_WIDTH / STICKER_HEIGHT; // 固定長寬比 1.15625

const LineStickerCropper = () => {
  const [image, setImage] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  
  // CropBox 狀態
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // 操作模式
  const [interactionMode, setInteractionMode] = useState(null);
  
  // 紀錄拖曳起始點
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialBox: null });

  const [showCropBox, setShowCropBox] = useState(true);

  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);
  const sortableRef = useRef(null);

  useEffect(() => {
    if (sortableRef.current) {
      Sortable.create(sortableRef.current, {
        animation: 150,
        onEnd: (evt) => {
          const reorderedImages = [...croppedImages];
          const [movedImage] = reorderedImages.splice(evt.oldIndex, 1);
          reorderedImages.splice(evt.newIndex, 0, movedImage);
          setCroppedImages(reorderedImages);
        },
      });
    }
  }, [croppedImages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setCroppedImages([]); 
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && imageRef.current) {
      const imgW = imageRef.current.clientWidth;
      const imgH = imageRef.current.clientHeight;

      const initialWidth = imgW * 0.3; 
      const initialHeight = initialWidth / ASPECT_RATIO;

      setCropBox({
        x: (imgW - initialWidth) / 2,
        y: (imgH - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
    }
  }, [image]);

  const handleMouseDown = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX;
    const clientY = e.clientY;

    setInteractionMode(mode);
    setDragStart({
      x: clientX,
      y: clientY,
      initialBox: { ...cropBox },
    });
  };

  const handleMouseMove = (e) => {
    if (!interactionMode || !imageRef.current) return;

    e.preventDefault();

    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const containerW = imageRef.current.clientWidth;
    const containerH = imageRef.current.clientHeight;

    if (interactionMode === 'move') {
      let newX = dragStart.initialBox.x + deltaX;
      let newY = dragStart.initialBox.y + deltaY;

      newX = Math.max(0, Math.min(newX, containerW - cropBox.width));
      newY = Math.max(0, Math.min(newY, containerH - cropBox.height));

      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));

    } else if (interactionMode === 'resize') {
      let newWidth = dragStart.initialBox.width + deltaX;
      if (newWidth < 50) newWidth = 50;

      let newHeight = newWidth / ASPECT_RATIO;

      if (dragStart.initialBox.x + newWidth > containerW) {
        newWidth = containerW - dragStart.initialBox.x;
        newHeight = newWidth / ASPECT_RATIO;
      }
      if (dragStart.initialBox.y + newHeight > containerH) {
        newHeight = containerH - dragStart.initialBox.y;
        newWidth = newHeight * ASPECT_RATIO;
      }

      setCropBox((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));
    }
  };

  const handleMouseUp = () => {
    setInteractionMode(null);
  };

  const handleCropAndAdd = () => {
    if (!image) return;

    const originalImage = new Image();
    originalImage.src = image;
    originalImage.onload = () => {
      const scaleX = originalImage.naturalWidth / imageRef.current.clientWidth;
      const scaleY = originalImage.naturalHeight / imageRef.current.clientHeight;

      const sourceX = cropBox.x * scaleX;
      const sourceY = cropBox.y * scaleY;
      const sourceWidth = cropBox.width * scaleX;
      const sourceHeight = cropBox.height * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = STICKER_WIDTH;
      canvas.height = STICKER_HEIGHT;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        originalImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, STICKER_WIDTH, STICKER_HEIGHT
      );

      setCroppedImages([
        ...croppedImages,
        {
          src: canvas.toDataURL('image/png'),
          id: `sticker-${Date.now()}`,
        },
      ]);
    };
  };

  const handleDownload = (src, index) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `sticker_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    croppedImages.forEach((img, index) => {
      const base64Data = img.src.split(',')[1];
      zip.file(`sticker_${String(index + 1).padStart(2, '0')}.png`, base64Data, { base64: true });
    });
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'stickers.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>LINE Sticker Cropper</h2>
      <div style={{ marginBottom: '15px' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <label style={{ marginLeft: '15px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showCropBox}
            onChange={() => setShowCropBox(!showCropBox)}
          />
          顯示裁切框
        </label>
      </div>

      <div
        ref={imageContainerRef}
        style={{
          position: 'relative',
          maxWidth: '1000px',
          border: '1px solid #ddd',
          display: 'inline-block',
          userSelect: 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {image && (
          <>
            <img
              ref={imageRef}
              src={image}
              alt="Upload"
              style={{ maxWidth: '100%', display: 'block', pointerEvents: 'none' }}
            />

            {/* 原本的半透明遮罩層已移除 */}

            {showCropBox && (
              <div
                style={{
                  position: 'absolute',
                  top: `${cropBox.y}px`,
                  left: `${cropBox.x}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                  border: '2px solid #00c300', // 保持綠色邊框
                  // box-shadow 已移除，保持畫面乾淨
                  boxSizing: 'border-box',
                  cursor: 'move',
                  zIndex: 10
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* 上方浮動按鈕 */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleCropAndAdd}
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '0',
                    backgroundColor: '#00c300',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'auto',
                    zIndex: 20
                  }}
                >
                  ✓ 裁切此區塊
                </button>

                {/* 輔助格線 (稍微加深一點顏色，因為沒有深色背景了，怕看不清楚) */}
                <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', 
                    background: 'rgba(255,255,255,0.8)', pointerEvents: 'none',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)' // 加一點陰影讓白線在淺色圖上也看得到
                }}></div>
                <div style={{
                    position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', 
                    background: 'rgba(255,255,255,0.8)', pointerEvents: 'none',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                }}></div>

                {/* 縮放手把 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#fff',
                    border: '2px solid #00c300',
                    cursor: 'nwse-resize',
                    borderRadius: '50%',
                    zIndex: 20
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'resize')}
                />
              </div>
            )}
          </>
        )}
      </div>

      {image && (
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={handleCropAndAdd} 
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#00c300', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            裁切並加入列表
          </button>
          {croppedImages.length > 0 && (
            <button 
              onClick={handleDownloadAll} 
              style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              下載全部 (Zip)
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>已裁切貼圖 (可拖曳排序) - 總數: {croppedImages.length}</h3>
        <div
          ref={sortableRef}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}
        >
          {croppedImages.map((img, index) => (
            <div key={img.id} style={{ textAlign: 'center', cursor: 'grab' }}>
              <div style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>
                <img
                  src={img.src}
                  alt={`Sticker ${index + 1}`}
                  style={{ width: '185px', height: '160px', objectFit: 'contain', background: '#f0f0f0' }}
                />
              </div>
              <div style={{ marginTop: '5px' }}>
                <small>#{index + 1}</small>
                <button onClick={() => handleDownload(img.src, index)} style={{ marginLeft: '5px' }}>
                  下載
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineStickerCropper;