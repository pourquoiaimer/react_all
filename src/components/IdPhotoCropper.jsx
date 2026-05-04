
import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { removeBackground } from '@imgly/background-removal';
import Sortable from 'sortablejs';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';

// --- Main Component with Menu ---
const DocumentImageTools = () => {
  const [activeTool, setActiveTool] = useState(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'id_photo':
        return <IdPhotoCropperTool />;
      case 'sticker':
        return <LineStickerCropperTool />;
      case 'converter':
        return <ImageConverterTool />;
      case 'pdf':
        return <PdfTool />;
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>文件圖片處理工具</h2>
            <button onClick={() => setActiveTool('id_photo')} style={menuButtonStyle}>證件照裁切</button>
            <button onClick={() => setActiveTool('sticker')} style={menuButtonStyle}>LINE 貼圖裁切</button>
            <button onClick={() => setActiveTool('converter')} style={menuButtonStyle}>圖片轉檔與壓縮</button>
            <button onClick={() => setActiveTool('pdf')} style={menuButtonStyle}>PDF 工具</button>
          </div>
        );
    }
  };

  return (
    <div>
      {activeTool && (
        <button onClick={() => setActiveTool(null)} style={{ margin: '10px', padding: '8px 12px' }}>
          &larr; 返回選單
        </button>
      )}
      {renderTool()}
    </div>
  );
};

const menuButtonStyle = {
  fontSize: '18px',
  padding: '15px 30px',
  margin: '10px',
  cursor: 'pointer',
  borderRadius: '8px',
  border: '1px solid #ccc',
  backgroundColor: '#f0f0f0'
};


// --- Tool 1: ID Photo Cropper ---

const cropperStyle = `
  .cropper-view-box {
    outline: 2px solid #39f;
    outline-color: rgba(51, 153, 255, 0.75);
  }
  .cropper-modal {
    opacity: 0.5;
    background-color: #000;
  }
  .cropper-dashed {
    display: none;
  }
`;

const hkPassportSpec = {
  name: '香港特區護照 (40mm x 50mm)',
  aspectRatio: 4 / 5,
  outputWidth: 1280,
  outputHeight: 1600,
  outputMimeType: 'image/jpeg',
  outputExtension: 'jpg',
};

const IdPhotoCropperTool = () => {
  const [image, setImage] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replaceBackground, setReplaceBackground] = useState(false);
  const cropperRef = useRef(null);
  const containerRef = useRef(null);
  const [topLineStyle, setTopLineStyle] = useState({ display: 'none' });
  const [chinLineStyle, setChinLineStyle] = useState({ display: 'none' });

  const selectedSpec = hkPassportSpec;

  const handleImageUpload = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) files = e.dataTransfer.files;
    else if (e.target) files = e.target.files;
    
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setCropData(null);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const getCropData = async () => {
    if (!cropperRef.current?.cropper) return;

    setIsProcessing(true);
    setCropData(null);

    try {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas({
        width: selectedSpec.outputWidth,
        height: selectedSpec.outputHeight,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (replaceBackground) {
        const croppedImageForProcessing = croppedCanvas.toDataURL('image/png');
        const transparentBlob = await removeBackground(croppedImageForProcessing);
        const image = new Image();
        const url = URL.createObjectURL(transparentBlob);

        const finalUrl = await new Promise((resolve, reject) => {
          image.onload = () => {
            URL.revokeObjectURL(url);
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = selectedSpec.outputWidth;
            finalCanvas.height = selectedSpec.outputHeight;
            const ctx = finalCanvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.drawImage(image, 0, 0);
            resolve(finalCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
          };
          image.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
          };
          image.src = url;
        });
        
        setCropData(finalUrl);

      } else {
        setCropData(croppedCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
      }
    } catch (error) {
      console.error("Could not process image:", error);
      if (cropperRef.current?.cropper) {
        const fallbackCanvas = cropperRef.current.cropper.getCroppedCanvas({
          width: selectedSpec.outputWidth,
          height: selectedSpec.outputHeight
        });
        setCropData(fallbackCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onCrop = () => {
    const cropperInstance = cropperRef.current?.cropper;
    const containerElement = containerRef.current;
    if (!cropperInstance || !containerElement) return;

    const viewBox = cropperInstance.cropper.querySelector('.cropper-view-box');
    if (!viewBox) return;

    const containerRect = containerElement.getBoundingClientRect();
    const viewBoxRect = viewBox.getBoundingClientRect();
    const relativeTop = viewBoxRect.top - containerRect.top;
    const relativeLeft = viewBoxRect.left - containerRect.left;
    const topLineTop = relativeTop + (viewBoxRect.height * 0.08);
    const chinLineTop = relativeTop + (viewBoxRect.height * 0.76);
    const lineLeft = relativeLeft + (viewBoxRect.width * 0.1);
    const lineWidth = viewBoxRect.width * 0.8;

    const lineBaseStyle = {
      position: 'absolute',
      left: `${lineLeft}px`,
      width: `${lineWidth}px`,
      height: '2px',
      backgroundColor: '#39f',
      zIndex: 10,
      pointerEvents: 'none',
      display: 'block',
    };

    setTopLineStyle({ ...lineBaseStyle, top: `${topLineTop}px` });
    setChinLineStyle({ ...lineBaseStyle, top: `${chinLineTop}px` });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = cropData;
    link.download = `id_photo_hk_passport.${selectedSpec.outputExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const printImages = () => {
      const printableWindow = window.open('', '_blank');
      printableWindow.document.write(`
        <html><head><title>Print ID Photos</title><style>
              @media print { @page { size: 4in 6in; margin: 0; } body { margin: 0; display: flex; justify-content: center; align-items: center; } }
              .container { display: grid; grid-template-columns: repeat(2, 40mm); grid-template-rows: repeat(2, 50mm); width: 80mm; height: 100mm; gap: 0; page-break-inside: avoid; }
              .photo { width: 40mm; height: 50mm; object-fit: cover; }
        </style></head><body>
            <div class="container">
              <img src="${cropData}" class="photo" /><img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" /><img src="${cropData}" class="photo" />
            </div>
        </body></html>
      `);
      printableWindow.document.close();
      printableWindow.focus();
      setTimeout(() => { printableWindow.print(); }, 500);
  }
  
  const instructionText = '請將頭頂對齊上方藍線，下顎對齊下方藍線。';

  return (
    <div style={{ padding: '20px' }}>
      <style>{cropperStyle}</style>
      <h2>香港特區護照相片裁切</h2>
      <p style={{marginTop: '1rem'}}>{instructionText}</p>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div ref={containerRef} style={{ position: 'relative', marginTop: '1rem', width: '100%', maxWidth: '600px' }}>
          <Cropper
            ref={cropperRef}
            style={{ height: 400, width: '100%' }}
            aspectRatio={selectedSpec.aspectRatio}
            src={image}
            viewMode={1}
            guides={true}
            dragMode="move"
            modal={true}
            minCropBoxHeight={50}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            crop={onCrop}
            ready={onCrop}
          />
          <div style={topLineStyle}></div>
          <div style={chinLineStyle}></div>

          <div style={{marginTop: '1rem'}}>
            <input type="checkbox" id="replaceBackground" checked={replaceBackground} onChange={(e) => setReplaceBackground(e.target.checked)} />
            <label htmlFor="replaceBackground"> 更換為白色背景</label>
          </div>

           <button onClick={getCropData} style={{marginTop: '1rem'}} disabled={isProcessing}>
            {isProcessing ? '處理中...' : '裁切影像'}
           </button>
        </div>
      )}
      {cropData && (
        <div style={{marginTop: '1rem'}}>
          <h3>裁切預覽</h3>
          <img style={{ maxWidth: '100%', width: '240px', border: '1px solid #ccc' }} src={cropData} alt="cropped" />
          <div>
            <button onClick={downloadImage} style={{marginRight: '1rem'}}>下載單張照片</button>
            <button onClick={printImages}>生成4x6列印版本</button>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Tool 2: LINE Sticker Cropper ---

const STICKER_WIDTH = 370;
const STICKER_HEIGHT = 320;
const ASPECT_RATIO = STICKER_WIDTH / STICKER_HEIGHT;

const LineStickerCropperTool = () => {
  const [image, setImage] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [interactionMode, setInteractionMode] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialBox: null });
  const [showCropBox, setShowCropBox] = useState(true);

  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);
  const sortableRef = useRef(null);

  useEffect(() => {
    let sortable = null;
    if (sortableRef.current) {
      sortable = Sortable.create(sortableRef.current, {
        animation: 150,
        onEnd: (evt) => {
          setCroppedImages(currentImages => {
              const reorderedImages = [...currentImages];
              const [movedItem] = reorderedImages.splice(evt.oldIndex, 1);
              reorderedImages.splice(evt.newIndex, 0, movedItem);
              return reorderedImages;
          });
        },
      });
    }
    return () => {
      if (sortable) {
        sortable.destroy();
      }
    };
  }, []);

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
    setDragStart({ x: clientX, y: clientY, initialBox: { ...cropBox } });
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
      setCropBox((prev) => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => setInteractionMode(null);

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
      ctx.drawImage(originalImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, STICKER_WIDTH, STICKER_HEIGHT);
      setCroppedImages([...croppedImages, { src: canvas.toDataURL('image/png'), id: `sticker-${Date.now()}` }]);
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
          <input type="checkbox" checked={showCropBox} onChange={() => setShowCropBox(!showCropBox)} />
          顯示裁切框
        </label>
      </div>

      <div ref={imageContainerRef} style={{ position: 'relative', maxWidth: '1000px', border: '1px solid #ddd', display: 'inline-block', userSelect: 'none' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {image && (
          <>
            <img ref={imageRef} src={image} alt="Upload" style={{ maxWidth: '100%', display: 'block', pointerEvents: 'none' }} />
            {showCropBox && (
              <div style={{ position: 'absolute', top: `${cropBox.y}px`, left: `${cropBox.x}px`, width: `${cropBox.width}px`, height: `${cropBox.height}px`, border: '2px solid #00c300', boxSizing: 'border-box', cursor: 'move', zIndex: 10 }} onMouseDown={(e) => handleMouseDown(e, 'move')}>
                <button onMouseDown={(e) => e.stopPropagation()} onClick={handleCropAndAdd} style={{ position: 'absolute', top: '-40px', right: '0', backgroundColor: '#00c300', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', pointerEvents: 'auto', zIndex: 20 }}>
                  ✓ 裁切此區塊
                </button>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.8)', pointerEvents: 'none', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }}></div>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.8)', pointerEvents: 'none', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }}></div>
                <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '16px', height: '16px', backgroundColor: '#fff', border: '2px solid #00c300', cursor: 'nwse-resize', borderRadius: '50%', zIndex: 20 }} onMouseDown={(e) => handleMouseDown(e, 'resize')}></div>
              </div>
            )}
          </>
        )}
      </div>

      {image && (
        <div style={{ marginTop: '15px' }}>
          <button onClick={handleCropAndAdd} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#00c300', color: 'white', border: 'none', borderRadius: '5px' }}>
            裁切並加入列表
          </button>
          {croppedImages.length > 0 && ( <button onClick={handleDownloadAll} style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}> 下載全部 (Zip) </button> )}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>已裁切貼圖 (可拖曳排序) - 總數: {croppedImages.length}</h3>
        <div ref={sortableRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {croppedImages.map((img, index) => (
            <div key={img.id} style={{ textAlign: 'center', cursor: 'grab' }}>
              <div style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>
                <img src={img.src} alt={`Sticker ${index + 1}`} style={{ width: '185px', height: '160px', objectFit: 'contain', background: '#f0f0f0' }} />
              </div>
              <div style={{ marginTop: '5px' }}>
                <small>#{index + 1}</small>
                <button onClick={() => handleDownload(img.src, index)} style={{ marginLeft: '5px' }}> 下載 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Tool 3: Image Converter and Compressor ---

const ImageConverterTool = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [options, setOptions] = useState({
    maxSizeMB: 1,
    fileType: 'image/jpeg',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setOriginalSize(file.size / 1024 / 1024); // MB
      setCompressedUrl('');
      setCompressedSize(0);
      setShowSizeWarning(false);
    }
  };
  
  const handleValueChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleCompress = async () => {
    if (!originalFile) {
      alert('請先選擇一個檔案');
      return;
    }

    setIsProcessing(true);
    setCompressedUrl('');
    setCompressedSize(0);
    setShowSizeWarning(false);

    const compressionOptions = {
      maxSizeMB: Number(options.maxSizeMB),
      useWebWorker: true,
      fileType: options.fileType,
    };

    try {
      console.log("Compression options:", compressionOptions);
      const compressedFile = await imageCompression(originalFile, compressionOptions);
      
      setCompressedUrl(URL.createObjectURL(compressedFile));
      setCompressedSize(compressedFile.size / 1024 / 1024); // MB

      if (compressedFile.size > originalFile.size) {
        setShowSizeWarning(true);
      }

    } catch (error) {
      console.error('壓縮失敗:', error);
      alert(`壓縮失敗: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getOutputExtension = () => {
    return options.fileType === 'image/png' ? 'png' : 'jpg';
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>圖片轉檔與壓縮</h2>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />

      {originalUrl && (
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>原始圖片</h3>
            <img src={originalUrl} alt="Original" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
            <p>檔案大小: {originalSize.toFixed(3)} MB</p>
          </div>
          <div>
            <h3>預覽與設定</h3>
            <div style={{ marginBottom: '15px' }}>
              <label>
                目標檔案類型:
                <select name="fileType" value={options.fileType} onChange={handleValueChange} style={{ marginLeft: '10px' }}>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>
                最大檔案大小 (MB):
                <input
                  type="number"
                  name="maxSizeMB"
                  value={options.maxSizeMB}
                  onChange={handleValueChange}
                  style={{ marginLeft: '10px', width: '80px' }}
                  step="0.1"
                  min="0.1"
                />
              </label>
            </div>
            <button onClick={handleCompress} disabled={isProcessing}>
              {isProcessing ? '處理中...' : '開始壓縮'}
            </button>
            
            {compressedUrl && (
              <div style={{ marginTop: '20px' }}>
                <h3>壓縮/轉檔結果</h3>
                {showSizeWarning && (
                  <div style={{ padding: '10px', marginBottom: '10px', border: '1px solid #f0ad4e', backgroundColor: '#fcf8e3', color: '#8a6d3b', borderRadius: '4px' }}>
                    <strong>注意：</strong> 轉檔後的檔案大小比原始檔案大。這通常發生在將高壓縮率的 JPG 轉為無損的 PNG 格式時。
                  </div>
                )}
                <img src={compressedUrl} alt="Compressed" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
                <p>檔案大小: {compressedSize.toFixed(3)} MB ({((originalSize - compressedSize) / originalSize * 100).toFixed(1)}% 減少)</p>
                <a href={compressedUrl} download={`compressed_image.${getOutputExtension()}`}>
                  <button>下載圖片</button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Tool 4: PDF Tool ---

const PdfTool = () => {
  const [files, setFiles] = useState([]); // Now stores {file, name, pageCount, id}
  const [mode, setMode] = useState('merge'); // merge, split, extract
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const sortableListRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let sortableInstance = null;
    if (mode === 'merge' && sortableListRef.current) {
      sortableInstance = Sortable.create(sortableListRef.current, {
        animation: 150,
        handle: '.handle',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          setFiles(currentFiles => {
            const reorderedFiles = [...currentFiles];
            const [movedItem] = reorderedFiles.splice(oldIndex, 1);
            reorderedFiles.splice(newIndex, 0, movedItem);
            return reorderedFiles;
          });
        },
      });
    }
    return () => {
      if (sortableInstance) {
        sortableInstance.destroy();
      }
    };
  }, [mode, files]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    
    const filesWithInfo = [];
    for (const file of selectedFiles) {
        try {
            const pdfBytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            filesWithInfo.push({
                file,
                name: file.name,
                pageCount: pdf.getPageCount(),
                id: `${file.name}-${file.lastModified}-${file.size}`
            });
        } catch(err) {
            alert(`無法讀取檔案 ${file.name}。它可能已損壞或受密碼保護。`);
            console.error(err);
        }
    }

    if (mode === 'merge') {
      setFiles(currentFiles => [...currentFiles, ...filesWithInfo]);
    } else {
      setFiles(filesWithInfo);
    }
    
    setIsProcessing(false);
    if(fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      alert('請先選擇 PDF 檔案');
      return;
    }
    setIsProcessing(true);

    try {
      if (mode === 'merge') await mergePdfs();
      else if (mode === 'split') await splitPdf();
      else if (mode === 'extract') await extractPages();
    } catch (error) {
      alert(`處理失敗: ${error.message}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      alert('請至少選擇兩個 PDF 檔案來合併。');
      return;
    }
    const mergedPdf = await PDFDocument.create();
    for (const fileInfo of files) {
      const pdfBytes = await fileInfo.file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedPdfBytes = await mergedPdf.save();
    downloadPdf(mergedPdfBytes, 'merged.pdf');
  };

  const splitPdf = async () => {
    if (files.length !== 1) {
      alert('切割功能一次只能處理一個檔案');
      return;
    }
    const pdfBytes = await files[0].file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pageCount = pdf.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);
      const newPdfBytes = await newPdf.save();
      downloadPdf(newPdfBytes, `${files[0].name.replace(/\.pdf$/, '')}_page_${i + 1}.pdf`);
    }
  };

  const extractPages = async () => {
    if (files.length !== 1) { alert('提取功能一次只能處理一個檔案'); return; }
    if (!pageRange) { alert('請輸入要提取的頁碼範圍'); return; }
    
    const indices = parsePageRange(pageRange, files[0].pageCount);
    if (!indices.length) { alert('頁碼格式不正確或超出範圍。請使用如：1, 3-5, 8 的格式'); return; }

    const pdfBytes = await files[0].file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    downloadPdf(newPdfBytes, 'extracted_pages.pdf');
  };
  
  const parsePageRange = (rangeStr, maxPage) => {
      const indices = new Set();
      const parts = rangeStr.replace(/\s/g, '').split(',');
      for (const part of parts) {
          if (part.includes('-')) {
              let [start, end] = part.split('-').map(Number);
              if(start > end) [start, end] = [end, start];
              for (let i = start; i <= end; i++) {
                  if(i > 0 && i <= maxPage) indices.add(i - 1);
              }
          } else {
              const pageNum = Number(part);
              if(pageNum > 0 && pageNum <= maxPage) indices.add(pageNum - 1);
          }
      }
      return Array.from(indices).sort((a,b)=>a-b);
  }

  const downloadPdf = (bytes, filename) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeFile = (id) => {
      setFiles(currentFiles => currentFiles.filter(f => f.id !== id));
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>PDF 工具</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>
          選擇模式:
          <select value={mode} onChange={(e) => { setMode(e.target.value); setFiles([]); }} style={{ marginLeft: '10px' }}>
            <option value="merge">合併 PDF</option>
            <option value="split">切割 PDF (所有頁面)</option>
            <option value="extract">提取特定頁面</option>
          </select>
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
          <input type="file" ref={fileInputRef} accept=".pdf" multiple={mode === 'merge'} onChange={handleFileChange} />
      </div>

      { /* PDF List for Merging */ }
      {mode === 'merge' && files.length > 0 && (
        <div style={{border: '1px solid #ccc', borderRadius: '5px', padding: '10px'}}>
            <h4>待合併檔案 (可拖曳排序)</h4>
            <ul ref={sortableListRef} style={{listStyle: 'none', padding: 0}}>
                {files.map(f => (
                    <li key={f.id} data-id={f.id} style={{display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #eee', marginBottom: '5px', backgroundColor: 'white'}}>
                        <span className="handle" style={{cursor: 'grab', marginRight: '10px', fontSize: '18px'}}>&#x2630;</span>
                        <span style={{flexGrow: 1}}>{f.name} ({f.pageCount} 頁)</span>
                        <button onClick={() => removeFile(f.id)} style={{border: 'none', background: 'transparent', color: 'red', cursor: 'pointer', fontSize: '16px'}}>&#x2716;</button>
                    </li>
                ))}
            </ul>
             <button onClick={() => setFiles([])} style={{marginTop: '10px'}}>全部清除</button>
        </div>
      )}

      { /* File Info for Split/Extract */ }
      {(mode === 'split' || mode === 'extract') && files.length > 0 && (
          <p>已選擇檔案: <strong>{files[0].name}</strong> (共 {files[0].pageCount} 頁)</p>
      )}

      {mode === 'extract' && (
        <div style={{ marginBottom: '15px', marginTop: '10px' }}>
          <label>
            頁碼:
            <input 
              type="text" 
              value={pageRange} 
              onChange={(e) => setPageRange(e.target.value)} 
              placeholder="例如: 1, 3-5, 8" 
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>
      )}
      
      <button onClick={handleProcess} disabled={isProcessing || files.length === 0} style={{marginTop: '10px'}}>
        {isProcessing ? '處理中...' : `開始${mode === 'merge' ? '合併' : mode === 'split' ? '切割' : '提取'}`}
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
          <h4>使用說明:</h4>
          <ul>
              <li><b>合併 PDF:</b> 選擇或拖入多個 PDF 檔案，在列表中拖曳排序後，點擊「開始合併」。</li>
              <li><b>切割 PDF:</b> 選擇一個 PDF 檔案，工具會將每一頁都存成一個獨立的 PDF 檔案。</li>
              <li><b>提取特定頁面:</b> 選擇一個 PDF 檔案，並在頁碼欄位中輸入您想要的頁面。例如: "1, 3-5, 8" 會提取第 1, 3, 4, 5, 8 頁。</li>
          </ul>
      </div>

    </div>
  );
};


export default DocumentImageTools;
