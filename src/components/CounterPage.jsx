import { useState, useContext, useEffect } from 'react';
// import { AllData } from '../App';
import PropTypes from 'prop-types';

const CounterPage = () => {
    // const { setNowShow } = useContext(AllData);
    const [ptLevel, setPtLevel] = useState(1);

    // useEffect(() => {
    //     setNowShow("卡厄斯夢境 PT 計算機 (3人版)");
    // }, [setNowShow]);

    // Calculate PT Limit based on level
    // Level 1 = 30, Level 2 = 40, etc. => 30 + (Level - 1) * 10
    const ptLimit = Math.max(0, 30 + (Math.max(1, ptLevel) - 1) * 10);

    return (
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar: PT Limit Input */}
            <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>PT 等級 (1-15):</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="15" 
                        value={ptLevel} 
                        onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (val > 15) val = 15;
                            if (val < 1) val = 1;
                            setPtLevel(val);
                        }}
                        style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ fontWeight: 'bold', color: '#1565c0' }}>
                    本次 PT 上限: <span style={{ fontSize: '1.2em' }}>{ptLimit}</span>
                </div>
            </div>

            {/* 3 Columns Container */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', flexGrow: 1, overflowX: 'auto' }}>
                <CharacterColumn name="角色 1" ptLimit={ptLimit} />
                <CharacterColumn name="角色 2" ptLimit={ptLimit} />
                <CharacterColumn name="角色 3" ptLimit={ptLimit} />
            </div>
        </div>
    );
};

const CharacterColumn = ({ name, ptLimit }) => {
    // 狀態設定
    const [deleteCount, setDeleteCount] = useState(0);
    const [charDeleteCount, setCharDeleteCount] = useState(0);
    const [copyCount, setCopyCount] = useState(0);
    const [transformCount, setTransformCount] = useState(0);
    const [neutralTabooCount, setNeutralTabooCount] = useState(0);
    const [monsterCount, setMonsterCount] = useState(0);
    const [godFlashCount, setGodFlashCount] = useState(0);
    const [inspirationFlashCount, setInspirationFlashCount] = useState(0);

    // 成本計算邏輯
    const progressiveCosts = [0, 10, 30, 50, 70]; // 1st to 5th

    const calculateProgressiveCost = (count) => {
        let total = 0;
        for (let i = 0; i < count; i++) {
            if (i < progressiveCosts.length) {
                total += progressiveCosts[i];
            } else {
                total += 70;
            }
        }
        return total;
    };

    const deleteBaseCost = calculateProgressiveCost(deleteCount);
    const charDeleteExtraCost = charDeleteCount * 20;
    const totalDeleteCost = deleteBaseCost + charDeleteExtraCost;

    const copyCost = calculateProgressiveCost(copyCount);
    const transformCost = transformCount * 10;
    const neutralTabooCost = neutralTabooCount * 20;
    const monsterCost = monsterCount * 80;
    const godFlashCost = godFlashCount * 20;
    const inspirationFlashCost = inspirationFlashCount * 10; // Updated to 10 PT

    const totalPT = totalDeleteCost + copyCost + transformCost + neutralTabooCost + monsterCost + godFlashCost + inspirationFlashCost;

    const isOverLimit = totalPT > ptLimit;

    // 確保角色刪除次數不超過總刪除次數
    useEffect(() => {
        if (charDeleteCount > deleteCount) {
            setCharDeleteCount(deleteCount);
        }
    }, [deleteCount, charDeleteCount]);

    const handleReset = () => {
        if (window.confirm(`確定要重置 ${name} 的數值嗎？`)) {
            setDeleteCount(0);
            setCharDeleteCount(0);
            setCopyCount(0);
            setTransformCount(0);
            setNeutralTabooCount(0);
            setMonsterCount(0);
            setGodFlashCount(0);
            setInspirationFlashCount(0);
        }
    };

    return (
        <div style={{ 
            flex: 1, 
            minWidth: '250px',
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
            display: 'flex', 
            flexDirection: 'column',
            border: isOverLimit ? '2px solid #f44336' : '1px solid #ddd'
        }}>
            <div style={{ 
                padding: '10px', 
                background: isOverLimit ? '#ffebee' : '#f5f5f5', 
                fontWeight: 'bold', 
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
            }}>
                <span>{name}</span>
                <button onClick={handleReset} style={{ fontSize: '0.8em', padding: '2px 8px', cursor: 'pointer' }}>重置</button>
            </div>

            <div style={{ padding: '0 10px', flexGrow: 1, overflowY: 'auto' }}>
                <SectionTitle title="操作成本" />
                <CounterRow title="刪除卡牌" count={deleteCount} setCount={setDeleteCount} subtotal={deleteBaseCost} />
                <CounterRow title="└ 含角色卡" count={charDeleteCount} setCount={setCharDeleteCount} subtotal={charDeleteExtraCost} max={deleteCount} isSubItem />
                <CounterRow title="複製卡牌" count={copyCount} setCount={setCopyCount} subtotal={copyCost} />
                <CounterRow title="轉換卡牌" count={transformCount} setCount={setTransformCount} subtotal={transformCost} />

                <SectionTitle title="持有成本" />
                <CounterRow title="中立/禁忌" count={neutralTabooCount} setCount={setNeutralTabooCount} subtotal={neutralTabooCost} />
                <CounterRow title="怪物卡" count={monsterCount} setCount={setMonsterCount} subtotal={monsterCost} />
                <CounterRow title="神之一閃" count={godFlashCount} setCount={setGodFlashCount} subtotal={godFlashCost} />
                <CounterRow title="中立卡靈光一閃" count={inspirationFlashCount} setCount={setInspirationFlashCount} subtotal={inspirationFlashCost} />
            </div>

            <div style={{ 
                padding: '10px', 
                background: isOverLimit ? '#ffebee' : '#e3f2fd', 
                borderTop: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px'
            }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>總計</span>
                <span style={{ fontSize: '1.5em', fontWeight: 'bold', color: isOverLimit ? '#d32f2f' : '#1565c0' }}>{totalPT}</span>
            </div>
        </div>
    );
};

CharacterColumn.propTypes = {
    name: PropTypes.string.isRequired,
    ptLimit: PropTypes.number.isRequired
};

const SectionTitle = ({ title }) => (
    <div style={{ padding: '8px 0 5px', borderBottom: '1px solid #eee', marginTop: '5px', color: '#666', fontWeight: 'bold', fontSize: '0.9em' }}>
        {title}
    </div>
);

SectionTitle.propTypes = {
    title: PropTypes.string.isRequired
};

const CounterRow = ({ title, count, setCount, subtotal, max, isSubItem }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 0', 
        borderBottom: '1px solid #f0f0f0',
        paddingLeft: isSubItem ? '10px' : '0',
        fontSize: '0.9em'
    }}>
        <div style={{ flex:1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button onClick={() => setCount(Math.max(0, count - 1))} style={btnStyle}>-</button>
            <input 
                type="number" 
                className="no-spinner"
                value={count}
                onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 0;
                    if (val < 0) val = 0;
                    if (max !== undefined && val > max) val = max;
                    setCount(val);
                }}
                style={{ width: '40px', textAlign: 'center', padding: '2px', borderRadius: '3px', border: '1px solid #ddd', fontSize: '0.9em' }}
            />
            <button 
                onClick={() => {
                    if (max !== undefined && count >= max) return;
                    setCount(count + 1);
                }}
                style={btnStyle}
            >
                +
            </button>
        </div>
        <div style={{ width: '35px', textAlign: 'right', fontWeight: 'bold', color: subtotal > 0 ? '#d32f2f' : '#333', fontSize: '0.9em' }}>
            {subtotal}
        </div>
    </div>
);

CounterRow.propTypes = {
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    setCount: PropTypes.func.isRequired,
    subtotal: PropTypes.number.isRequired,
    max: PropTypes.number,
    isSubItem: PropTypes.bool
};

const btnStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '3px',
    border: '1px solid #ccc',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1em',
    color: '#555',
    padding: 0
};

export default CounterPage;
