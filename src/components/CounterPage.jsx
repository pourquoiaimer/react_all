import { useState } from 'react';
import PropTypes from 'prop-types';

const CounterPage = () => {
    const [ptLevel, setPtLevel] = useState(1);
    const ptLimit = Math.max(0, 30 + (Math.max(1, ptLevel) - 1) * 10);

    return (
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
            {/* 頂部 PT 等級設定 */}
            <div style={{ marginBottom: '15px', padding: '15px', background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>PT 等級 (1-16):</label>
                    <input 
                        type="number" min="1" max="15" 
                        value={ptLevel} 
                        onChange={(e) => setPtLevel(Math.min(16, Math.max(1, parseInt(e.target.value) || 1)))}
                        style={{ width: '55px', padding: '5px', borderRadius: '4px', border: 'none', textAlign: 'center' }}
                    />
                </div>
                <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                    存檔點數上限: <span style={{ fontSize: '1.3em', color: '#fff176' }}>{ptLimit}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                <CharacterColumn name="角色 1" ptLimit={ptLimit} />
                <CharacterColumn name="角色 2" ptLimit={ptLimit} />
                <CharacterColumn name="角色 3" ptLimit={ptLimit} />
            </div>
        </div>
    );
};

const CharacterColumn = ({ name, ptLimit }) => {
    // 狀態管理
    const [delStartCard, setDelStartCard] = useState(0); // 移除/轉換起始卡 (max 4, 20pt)
    const [delOtherRecord, setDelOtherRecord] = useState(0); // 其他移除/轉換紀錄 (0pt)
    const [copyCount, setCopyCount] = useState(0); // 複製 (max 4, 3-4次 40pt)
    const [neutralTaboo, setNeutralTaboo] = useState(0);
    const [mNormal, setMNormal] = useState(0);
    const [mRare, setMRare] = useState(0);
    const [mLegend, setMLegend] = useState(0);
    const [godFlash, setGodFlash] = useState(0);
    const [equipEffect, setEquipEffect] = useState(0);

    // 計算總分
    const deletePT = delStartCard * 20;
    const copyPT = copyCount > 2 ? (copyCount - 2) * 40 : 0;
    const monsterPT = (mNormal * 20) + (mRare * 50) + (mLegend * 80);
    const totalPT = deletePT + copyPT + (neutralTaboo * 20) + monsterPT + (godFlash * 20) + (equipEffect * 10);

    const isOver = totalPT > ptLimit;
    const totalDelRecords = delStartCard + delOtherRecord;

    const reset = () => {
        if(window.confirm(`重置 ${name} 的數據嗎？`)) {
            setDelStartCard(0); setDelOtherRecord(0); setCopyCount(0); setNeutralTaboo(0);
            setMNormal(0); setMRare(0); setMLegend(0); setGodFlash(0); setEquipEffect(0);
        }
    };

    return (
        <div style={{ flex: '1 0 280px', background: 'white', borderRadius: '10px', display: 'flex', flexDirection: 'column', border: isOver ? '2px solid #f44336' : '1px solid #ddd', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '12px', background: isOver ? '#ffebee' : '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                <strong style={{ color: isOver ? '#d32f2f' : '#333' }}>{name}</strong>
                <button onClick={reset} style={{ padding: '2px 8px', cursor: 'pointer', fontSize: '0.8em', borderRadius: '4px', border: '1px solid #ccc' }}>重置</button>
            </div>

            <div style={{ padding: '10px', flex: 1 }}>
                <SectionLabel title={`移除與複製 (紀錄: ${totalDelRecords}/5)`} />
                <CounterItem title="移除/轉換起始卡 (20pt)" val={delStartCard} set={setDelStartCard} max={4} sub={deletePT} />
                <CounterItem title="其他移除/轉換 (0pt)" val={delOtherRecord} set={setDelOtherRecord} max={5 - delStartCard} sub={0} color="#9e9e9e" />
                <CounterItem title="複製次數 (3-4張計費)" val={copyCount} set={setCopyCount} max={4} sub={copyPT} />

                <SectionLabel title="持有卡牌內容" />
                <CounterItem title="中立 / 禁忌卡 (20pt)" val={neutralTaboo} set={setNeutralTaboo} sub={neutralTaboo * 20} />
                <CounterItem title="普通怪物卡 (20pt)" val={mNormal} set={setMNormal} sub={mNormal * 20} />
                <CounterItem title="稀有怪物卡 (50pt)" val={mRare} set={setMRare} sub={mRare * 50} />
                <CounterItem title="傳說怪物卡 (80pt)" val={mLegend} set={setMLegend} sub={mLegend * 80} />

                <SectionLabel title="特殊強化與裝備" />
                <CounterItem title="神之靈光一閃 (20pt)" val={godFlash} set={setGodFlash} sub={godFlash * 20} />
                <CounterItem title="裝備效果 (10pt)" val={equipEffect} set={setEquipEffect} sub={equipEffect * 10} />
            </div>

            <div style={{ padding: '15px', background: isOver ? '#ffebee' : '#e3f2fd', borderTop: '1px solid #eee', textAlign: 'right', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                <div style={{ fontSize: '0.85em', color: '#666' }}>預估存檔總點數</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: isOver ? '#d32f2f' : '#1565c0' }}>{totalPT}</div>
            </div>
        </div>
    );
};

const SectionLabel = ({ title }) => (
    <div style={{ fontSize: '0.75em', color: '#1976d2', fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', borderLeft: '3px solid #1976d2', paddingLeft: '8px' }}>{title}</div>
);

const CounterItem = ({ title, val, set, sub, max, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9em' }}>
        <div style={{ color: color || '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button onClick={() => set(Math.max(0, val - 1))} style={btnS}>-</button>
            <span style={{ width: '25px', textAlign: 'center', fontWeight: '500' }}>{val}</span>
            <button onClick={() => set(max !== undefined ? Math.min(max, val + 1) : val + 1)} style={btnS}>+</button>
            <div style={{ width: '40px', textAlign: 'right', fontWeight: 'bold', color: sub > 0 ? '#d32f2f' : '#bbb' }}>{sub > 0 ? sub : (sub === 0 && color ? '-' : '0')}</div>
        </div>
    </div>
);

const btnS = { 
    width: '24px', height: '24px', border: '1px solid #ddd', background: 'white', 
    borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

CharacterColumn.propTypes = { name: PropTypes.string.isRequired, ptLimit: PropTypes.number.isRequired };
SectionLabel.propTypes = { title: PropTypes.string.isRequired };
CounterItem.propTypes = { title: PropTypes.string.isRequired, val: PropTypes.number.isRequired, set: PropTypes.func.isRequired, sub: PropTypes.number.isRequired, max: PropTypes.number, color: PropTypes.string };

export default CounterPage;