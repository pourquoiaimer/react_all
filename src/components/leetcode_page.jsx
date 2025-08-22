import { useState, useEffect } from "react";

const Leetcode = () => {
    const [ans, setAns] = useState("")
    const [test_case, setTest_case] = useState("")

    //位數法，1位與最大的比，2位與次大的比x跟總位數-x+1---算法部份可以是兩個數字都/x或者位數-x後無條件捨去取整


    function isPalindrome(x) {
        if(typeof x != "number"){
            return false
        }

        if (x < 0) { return false }
        if (x < 10) { return true }

        // let arr = []
        let num_digits = 1 //位數
        let num = x

        while (num / 10 > 1) {
            console.log(1);

            num = num / 10
            num_digits++
        }
        //num_digits會是總位數，現在知道位數了
        let palindrome = 0
        let num_ori = x

        for (let index = num_digits; index < 2; index - 1) {
            console.log(12);

            // palindrome += Math.floor(num_ori / 10 ** index - 1)
            console.log(Math.floor(num_ori / 10 ** index - 1));

        }


        // let arr = []
        // for (let i = 0; i < num_digits; i++) {
        //     arr.push(Math.floor(x / Math.pow(10, i)) % 10)
        // }
        // console.log(arr);
        return true

        if (num_digits == 1) { return true }
        // return true
    }


    useEffect(() => {
        if (test_case != "") {
            setAns(isPalindrome(test_case))
        }

    }, [test_case])


    ///按照位數去除-得到的數字MATH.floor就是那一位數，考慮直接做一個代換把最小位數去變成最大位還是用比較的
    //代換應該比較簡單

    return (
        <div>
            <h3>test case</h3>
            <input type="text" id="test_case" onBlur={(e) => setTest_case(e.target.value)}></input>
            <h3>ans</h3>

            <span>{ans ? "true" : "false"}</span>

        </div>
    )
}
export default Leetcode;
