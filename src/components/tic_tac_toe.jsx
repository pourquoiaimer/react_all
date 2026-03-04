import { useState, useEffect } from "react";

// Modal Component defined inside for simplicity
const Modal = ({ message, onClose }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
        <div style={{
            backgroundColor: 'white', padding: '20px 40px', borderRadius: '10px',
            textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>{message}</h3>
            <button onClick={onClose} style={{
                padding: '10px 20px', fontSize: '16px', cursor: 'pointer',
                border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white'
            }}>確定</button>
        </div>
    </div>
);


const Tic_Tac_Toe = () => {
    const [teamO, setTeamO] = useState("");
    const [teamX, setTeamX] = useState("");
    const [nowTurn, setNowTurn] = useState("O");
    const [win_check] = useState(["t", "m", "b", "l", "c", "r", "x", "y"]);
    const [winner, setWinner] = useState(false); // 'O', 'X', 'Draw', or false

    // New states
    const [moveCount, setMoveCount] = useState(0);
    const [winningCells, setWinningCells] = useState([]); // e.g., ['tlx', 'tc', 'try']
    const [modal, setModal] = useState({ show: false, message: '' });

    // Maps the win-checking character to the actual cell keys
    const line_to_keys = {
        t: ['tlx', 'tc', 'try'],
        m: ['ml', 'mcxy', 'mr'],
        b: ['bly', 'bc', 'brax'],
        l: ['tlx', 'ml', 'bly'],
        c: ['tc', 'mcxy', 'bc'],
        r: ['try', 'mr', 'brax'],
        x: ['tlx', 'mcxy', 'brax'],
        y: ['try', 'mcxy', 'bly']
    };

    // Added: Map keys to their original CSS classes for borders
    const cellClasses = {
        tlx: "border_bottom border_right",
        tc: "border_bottom border_right",
        try: "border_bottom",
        ml: "border_bottom border_right",
        mcxy: "border_bottom border_right",
        mr: "border_bottom",
        bly: "border_right",
        bc: "border_right",
        brax: "",
    };


    useEffect(() => {
        if (winner) return; // Stop checking if there's already a winner

        const check_info = check_win(); // Returns { winner: 'O'|'X', line: 't'|'m'|... }
        if (check_info) {
            setWinner(check_info.winner);
            setWinningCells(line_to_keys[check_info.line]);
        } else if (moveCount === 9) {
            setWinner("Draw"); // Set winner to 'Draw' for a tie
        }
    }, [teamO, teamX, moveCount]);

    // Effect to show the modal when the game ends
    useEffect(() => {
        if (!winner) return;

        let message = '';
        if (winner === 'Draw') {
            message = '遊戲平手！';
        } else {
            message = `勝利者是 ${winner}！`;
        }

        // Use a timeout to ensure the winning cells are highlighted before the modal appears
        setTimeout(() => {
            setModal({ show: true, message: message });
        }, 100);

    }, [winner]);


    function check_win() {
        for (const data of win_check) {
            if (teamO.split(data).length >= 4) {
                return { winner: "O", line: data };
            }
            if (teamX.split(data).length >= 4) {
                return { winner: "X", line: data };
            }
        }
        return null; // Return null instead of false
    }


    function occupied(e) {
        if (winner || e.target.textContent !== "") { return } // Game over or cell taken

        let now_td = e.target.dataset.key;
        let temp;
        
        switch (nowTurn) {
            case "O":
                temp = teamO;
                e.target.textContent = "O";
                setTeamO(temp + now_td);
                setNowTurn("X");
                break;
            case "X":
                temp = teamX;
                e.target.textContent = "X";
                setTeamX(temp + now_td);
                setNowTurn("O");
                break;
            default:
                console.log("not start");
                return;
        }
        setMoveCount(prevCount => prevCount + 1);
    }

    function restart_act() {
        // Clear the visual board
        let temp_arr = Array.from(document.getElementsByTagName("td"));
        temp_arr.forEach(data => {
            data.textContent = "";
        });

        // Reset all states to initial values
        setNowTurn("O");
        setTeamO("");
        setTeamX("");
        setWinner(false);
        setMoveCount(0);
        setWinningCells([]);
        setModal({ show: false, message: '' }); // Hide modal
    }

    // A helper function to render cells to avoid repetition
    const renderCell = (key) => {
        const isWinning = winningCells.includes(key);
        return (
            <td
                className={cellClasses[key]} // Restored the className for borders
                onClick={(e) => { occupied(e) }}
                data-key={key}
                style={{ backgroundColor: isWinning ? 'lightcoral' : 'transparent' }}
            ></td>
        );
    };

    return (
        <>
            {modal.show && <Modal message={modal.message} onClose={() => setModal({ show: false, message: '' })} />}

            <div className="game_info">
                <h2>Now Turn : {nowTurn}</h2>
                <button className="restart_btn" onClick={restart_act}>Restart</button>
            </div>
            <table id="ttt_table">
                <tbody>
                    <tr>
                        {renderCell("tlx")}
                        {renderCell("tc")}
                        {renderCell("try")}
                    </tr>
                    <tr>
                        {renderCell("ml")}
                        {renderCell("mcxy")}
                        {renderCell("mr")}
                    </tr>
                    <tr>
                        {renderCell("bly")}
                        {renderCell("bc")}
                        {renderCell("brax")}
                    </tr>
                </tbody>
            </table>
        </>
    );
}
export default Tic_Tac_Toe;
