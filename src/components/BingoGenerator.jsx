
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf"; 

const BingoCell = ({ item }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    // 使用 useLayoutEffect 確保在瀏覽器繪製前完成計算，避免畫面閃爍，並確保截圖時已經是正確的字體大小
    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (!container || !text || !item) return;

        // 預設最大字體，如果字少可以顯示較大
        let currentSize = 20; 
        text.style.fontSize = `${currentSize}px`;

        // 使用迴圈逐步縮小字體，直到文字的實際高度與寬度不超過容器大小
        // 加入安全底線 currentSize > 8，避免字體縮到看不見
        while (
            (container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth) &&
            currentSize > 8
        ) {
            currentSize -= 0.5;
            text.style.fontSize = `${currentSize}px`;
        }
    }, [item]);

    const cellStyle = {
        border: '1px solid black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // 確保 flex 項目不會因為內容撐開網格 (非常關鍵)
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        height: '100%',
    };

    return (
        <div ref={containerRef} style={cellStyle}>
            <span ref={textRef} style={{ wordBreak: 'break-word', textAlign: 'center', lineHeight: '1.2', width: '100%' }}>
                {item}
            </span>
        </div>
    );
};

const BingoCard = React.forwardRef(({ items, gridSize }, ref) => {
    const cardStyle = {
        display: 'grid',
        // 使用 minmax(0, 1fr) 確保每格嚴格均分，不會被過長的連續文字撐破
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        border: '2px solid black',
        width: '400px',
        height: '400px',
        backgroundColor: 'white',
        boxSizing: 'border-box',
    };

    return (
        <div ref={ref} style={cardStyle}>
            {items.map((item, index) => (
                <BingoCell key={index} item={item} />
            ))}
        </div>
    );
});

const BingoGenerator = () => {
    const [gridSize, setGridSize] = useState(4);
    const [printSize, setPrintSize] = useState('small'); // 'small' or 'large'
    const [cardCount, setCardCount] = useState(1);
    const [bingoData, setBingoData] = useState('');
    const [generating, setGenerating] = useState(false);
    const [cardsToRender, setCardsToRender] = useState([]);
    const cardRefs = useRef([]);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    useEffect(() => {
        let isMounted = true;

        if (cardsToRender.length === 0 || !generating) {
            return;
        }

        const captureAndGeneratePdf = async () => {
            try {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();
                const isLarge = printSize === 'large';
                const cardsPerPage = isLarge ? 2 : 6;
                const cols = isLarge ? 1 : 2;
                const rows = isLarge ? 2 : 3;
                const imgWidth = isLarge ? 120 : 90;
                const imgHeight = isLarge ? 120 : 90;
                const xMargin = (pageW - (cols * imgWidth)) / (cols + 1);
                const yMargin = (pageH - (rows * imgHeight)) / (rows + 1);
                
                let cardsOnCurrentPage = 0;

                for (let i = 0; i < cardsToRender.length; i++) {
                    if (!isMounted) break;

                    const cardElement = cardRefs.current[i];
                    if (!cardElement) {
                        console.error(`無法找到第 ${i + 1} 張卡片的元素進行截圖。`);
                        continue;
                    }

                    const canvas = await html2canvas(cardElement, {
                        // 提高截圖縮放比例 (scale) 來提升解析度，通常設為 3 或 4 可以達到印刷級別的清晰度 (300 DPI 左右)
                        scale: 3,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                    });

                    if (i > 0 && i % cardsPerPage === 0) {
                        pdf.addPage();
                        cardsOnCurrentPage = 0;
                    }

                    const imgData = canvas.toDataURL('image/png');
                    const row = Math.floor(cardsOnCurrentPage / cols);
                    const col = cardsOnCurrentPage % cols;
                    const posX = xMargin + col * (imgWidth + xMargin);
                    const posY = yMargin + row * (imgHeight + yMargin);

                    pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
                    cardsOnCurrentPage++;
                }

                if (isMounted) {
                    pdf.save('bingo_cards.pdf');
                }

            } catch (error) {
                console.error("產生 PDF 時發生錯誤:", error);
                if (isMounted) {
                    alert("抱歉，產生 PDF 時發生預期外的錯誤。請在瀏覽器開發者工具中查看主控台(console)以獲取更多資訊。");
                }
            } finally {
                if (isMounted) {
                    setGenerating(false);
                    setCardsToRender([]);
                }
            }
        };
        
        // 修正：給予瀏覽器足夠的重繪時間 (setTimeout) 而非使用 requestAnimationFrame
        // 這能確保 DOM 元素已確實渲染在畫面上，避免 html2canvas 截到空白或破圖
        const timeoutId = setTimeout(captureAndGeneratePdf, 100);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };

    }, [cardsToRender, generating, printSize]);

    const handleGenerateClick = () => {
        const allItems = bingoData.split('\n').filter(item => item.trim() !== '');
        const requiredItems = gridSize * gridSize;

        if (allItems.length > 0 && allItems.length < requiredItems) {
            alert(`您提供了 ${allItems.length} 個項目，但 ${gridSize}x${gridSize} 的網格需要至少 ${requiredItems} 個項目。`);
            return;
        }

        cardRefs.current = []; // Reset refs before each generation
        setGenerating(true);

        const cardData = [];
        for (let i = 0; i < cardCount; i++) {
            const itemsForCard = allItems.length > 0 
                ? shuffleArray([...allItems]).slice(0, requiredItems) 
                : Array(requiredItems).fill('');
            cardData.push(itemsForCard);
        }
        
        setCardsToRender(cardData);
    };

    return (
        <div>
            <h2>Bingo 產生器</h2>
            
            <div style={{ position: 'absolute', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}>
                {cardsToRender.map((items, i) => (
                    <BingoCard
                        key={i}
                        ref={el => { cardRefs.current[i] = el; }}
                        items={items}
                        gridSize={gridSize}
                    />
                ))}
            </div>

            <div>
                <label>
                    網格大小 (Grid Size):
                    <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} disabled={generating}>
                        <option value={3}>3x3</option>
                        <option value={4}>4x4</option>
                        <option value={5}>5x5</option>
                    </select>
                </label>
            </div>
            <div style={{ margin: '10px 0' }}>
                <span style={{ marginRight: '10px' }}>列印尺寸 (Print Size):</span>
                <label style={{ marginRight: '15px' }}>
                    <input
                        type="radio"
                        value="small"
                        checked={printSize === 'small'}
                        onChange={() => setPrintSize('small')}
                        disabled={generating}
                    />
                    小卡 (9x9 cm, 一頁 6 張)
                </label>
                <label>
                    <input
                        type="radio"
                        value="large"
                        checked={printSize === 'large'}
                        onChange={() => setPrintSize('large')}
                        disabled={generating}
                    />
                    大卡 (12x12 cm, 一頁 2 張)
                </label>
            </div>
            <div style={{ margin: '10px 0' }}>
                <label>
                    卡片數量 (Number of Cards):
                    <input
                        type="number"
                        value={cardCount}
                        onChange={(e) => setCardCount(Math.max(1, Number(e.target.value)))}
                        min="1"
                        disabled={generating}
                    />
                </label>
            </div>
            <div>
                <label>
                    Bingo 項目 (一行一項):
                    <textarea
                        rows="10"
                        cols="50"
                        value={bingoData}
                        onChange={(e) => setBingoData(e.target.value)}
                        placeholder="請在此輸入每個 Bingo 格子的內容，一行一個。"
                        disabled={generating}
                    />
                </label>
            </div>
            <button onClick={handleGenerateClick} disabled={generating} style={{ marginTop: '10px' }}>
                {generating ? '正在生成 PDF...' : '產生 Bingo 卡片'}
            </button>
        </div>
    );
};

export default BingoGenerator;
