
import React, { useState, useEffect, useMemo } from 'react';

// --- Constants ---
const RIOT_API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const API_URL = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=zh-TW';
const TARGET_LEAGUES = ['LCK', 'LPL', 'LCP'];
const DEFAULT_LOL_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/League_of_Legends_2019_vector.svg/1200px-League_of_Legends_2019_vector.svg.png';

// --- Reusable Child Component for Robust Image Handling ---
// This component internally handles image loading errors.
const TeamImage = ({ src, alt, style }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src); // Reset src if the parent component provides a new one
    }, [src]);

    const handleError = () => {
        // If the image fails to load, set it to the default LoL icon.
        setImgSrc(DEFAULT_LOL_ICON);
    };

    return <img src={imgSrc} alt={alt} style={style} onError={handleError} />;
};


// --- Main Component ---
const LolMatches = () => {
    // --- States ---
    const [allMatches, setAllMatches] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_URL, { headers: { 'x-api-key': RIOT_API_KEY } });
                if (!response.ok) throw new Error('API 請求失敗，請檢查網路或 API Key');
                
                const json = await response.json();
                const events = json.data?.schedule?.events || [];

                const now = new Date();
                now.setHours(0, 0, 0, 0); // Set to the beginning of today

                // Filter for future matches from target leagues
                const filtered = events.filter(event => {
                    const matchTime = new Date(event.startTime);
                    return event.type === 'match' && 
                           TARGET_LEAGUES.includes(event.league.name) && 
                           matchTime >= now;
                });
                
                setAllMatches(filtered);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    // --- Memoized Computations for Performance ---
    const displayMatches = useMemo(() => {
        if (selectedLeague === 'All') {
            return allMatches;
        }
        return allMatches.filter(event => event.league.name === selectedLeague);
    }, [allMatches, selectedLeague]);

    // --- Render Logic ---
    if (loading) return <div style={styles.message}>載入賽程中...</div>;
    if (error) return <div style={styles.message}>{error.message}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>LoL 主要賽事</h2>

            <div style={styles.controlsContainer}>
                {/* League Selector */}
                <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} style={styles.select}>
                    <option value="All">所有主要賽區</option>
                    {TARGET_LEAGUES.map(league => (
                        <option key={league} value={league}>{league}</option>
                    ))}
                </select>
            </div>

            {displayMatches.length > 0 ? (
                <div style={styles.listContainer}>
                    {displayMatches.map(event => {
                        const { teams, strategy } = event.match;
                        const [team1, team2] = teams;

                        let matchState;
                        if (event.state === 'completed') {
                            matchState = (
                                <div style={styles.scoreBox}>
                                    <span>{team1.result.gameWins}</span>
                                    <span>-</span>
                                    <span>{team2.result.gameWins}</span>
                                </div>
                            );
                        } else if (event.state === 'inProgress') {
                            matchState = <div style={styles.inProgress}>比賽中</div>;
                        } else {
                            matchState = <div style={styles.vs}>VS</div>;
                        }

                        const matchDate = new Date(event.startTime);
                        const dateStr = matchDate.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
                        const timeStr = matchDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={event.match.id} style={styles.matchCard}>
                                <div style={styles.timeInfo}>
                                    <div style={styles.date}>{dateStr}</div>
                                    <div style={styles.time}>{timeStr}</div>
                                    <span style={styles.leagueBadge}>{event.league.name}</span>
                                </div>

                                <div style={styles.matchup}>
                                    <div style={{...styles.team, justifyContent: 'flex-end'}}>
                                        <span style={styles.teamName}>{team1.code}</span>
                                        <TeamImage src={team1.image} alt={team1.code} style={styles.teamLogo} />
                                    </div>
                                    {matchState}
                                    <div style={{...styles.team, justifyContent: 'flex-start'}}>
                                        <TeamImage src={team2.image} alt={team2.code} style={styles.teamLogo} />
                                        <span style={styles.teamName}>{team2.code}</span>
                                    </div>
                                </div>
                                
                                <div style={styles.metaInfo}>
                                    <div style={styles.boTag}>BO{strategy.count}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={styles.message}>目前沒有即將到來的賽事。</div>
            )}
        </div>
    );
};

// --- Styles ---
const styles = {
    container: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        minHeight: '100vh'
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px'
    },
    message: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontSize: '1.2rem'
    },
    controlsContainer: {
        marginBottom: '25px',
    },
    select: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        textAlign: 'center',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23333'%3E%3Cpath d='M8 11.207l-4.6-4.6L4.807 5.2 8 8.393 11.193 5.2l1.414 1.407z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em',
    },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    matchCard: {
        display: 'grid',
        gridTemplateColumns: '100px 1fr 60px',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    timeInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
    date: { fontSize: '12px', color: '#888' },
    time: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
    leagueBadge: { fontSize: '10px', padding: '2px 6px', backgroundColor: '#eee', borderRadius: '4px', color: '#555', fontWeight: 600 },
    matchup: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px' },
    team: { display: 'flex', alignItems: 'center', gap: '10px', width: '140px' },
    teamName: { fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    teamLogo: { width: '36px', height: '36px', objectFit: 'contain', backgroundColor: '#f0f0f0', borderRadius: '50%' },
    scoreBox: { display: 'flex', gap: '8px', fontWeight: 'bold', fontSize: '18px', color: '#333', width: '80px', justifyContent: 'center', alignItems: 'center' },
    inProgress: { color: '#d93025', fontWeight: 'bold', fontSize: '16px', width: '80px', textAlign: 'center' },
    vs: { color: '#999', fontSize: '12px', fontWeight: 'bold', width: '80px', textAlign: 'center' },
    metaInfo: { display: 'flex', justifyContent: 'flex-end' },
    boTag: { fontSize: '12px', color: '#0070f3', fontWeight: 'bold', border: '1px solid #0070f3', padding: '3px 7px', borderRadius: '4px' }
};

export default LolMatches;
