import { useState, useEffect } from "react";

const Tic_Tac_Toe = () => {
    const [teamO, setTeamO] = useState("")
    const [teamX, setTeamX] = useState("")
    const [nowTurn, setNowTurn] = useState("O")
    const [win_check] = useState(["t", "m", "b", "l", "c", "r", "x", "y"])//有三個或在
    const [winner, setWinner] = useState(false)



    useEffect(() => {
        let check_info = check_win()
        if (check_info) {
            setWinner(check_info)
        }
    }, [teamO, teamX])
    useEffect(() => {
        if (winner) {
            alert(`勝利者是${winner}`,restart_act())
        }
    }, [winner])

    function check_win() {
        let winner_check = false
        win_check.map(function (data) {
            if (teamO.split(data).length >= 4) {
                winner_check = "O"
            } else if (teamX.split(data).length >= 4) {
                winner_check = "X"
            }
        })
        return winner_check
    }

    function occupied(e) {
        if (winner) { return }
        let now_td = e.target.dataset.key
        let temp
        if (e.target.textContent != "") {
            return
        }
        switch (nowTurn) {
            case "O":
                temp = teamO
                e.target.textContent = "O"
                setTeamO(temp += now_td)
                setNowTurn("X")

                break;
            case "X":
                temp = teamX
                e.target.textContent = "X"

                setTeamX(temp += now_td)
                setNowTurn("O")
                break;
            default:
                console.log("not start")
                break;
        }

    }
    function restart_act() {
        let temp_arr = Array.apply(null,document.getElementsByTagName("td"))
        temp_arr.map(function (data) {
            data.textContent =""
        })
        setNowTurn("O")
        setTeamO("")
        setTeamX("")
        setWinner(false)
    }
    // top middle bottom
    // left center right 


    return (
        <>
            <div className="game_info">
                <h2>Now Turn : {nowTurn}</h2> 
                <button className="restart_btn" onClick={restart_act}>Restart</button>
            </div>
            <table id="ttt_table">
                <tr>
                    <td className="border_bottom border_right" onClick={(e) => { occupied(e) }} data-key="tlx"></td>
                    <td className="border_bottom border_right" onClick={(e) => { occupied(e) }} data-key="tc"></td>
                    <td className="border_bottom " onClick={(e) => { occupied(e) }} data-key="try"></td>
                </tr>
                <tr >
                    <td className="border_bottom border_right" onClick={(e) => { occupied(e) }} data-key="ml"></td>
                    <td className="border_bottom border_right" onClick={(e) => { occupied(e) }} data-key="mcxy"></td>
                    <td className="border_bottom " onClick={(e) => { occupied(e) }} data-key="mr"></td>
                </tr>
                <tr>
                    <td className="border_right" onClick={(e) => { occupied(e) }} data-key="bly"></td>
                    <td className="border_right" onClick={(e) => { occupied(e) }} data-key="bc"></td>
                    <td onClick={(e) => { occupied(e) }} data-key="brax"></td>
                </tr>

            </table>
        </>

    )
}
export default Tic_Tac_Toe;
