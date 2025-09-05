import { useState, useEffect } from "react";

const Leetcode = () => {
    const [ans, setAns] = useState("")
    const [test_case, setTest_case] = useState("")
    const [test_case_] = useState([["aab", "c*a*b"], ["aa", "a*"], ["ab", ".*"]])

    function testFn(s, p) {
        if (s == p) { return true }
        // if (p.length > s.length) { return false }
        if (p.startsWith("*")) {
            return false
        }
        let ans = true
        let arr_s = s.split("")
        let arr_p = p.split("")
        let now_p = 0
        for (let i = 0; i < arr_s.length; i++) {
            if(now_p>=arr_p.length){
                ans = false
                break
            }
            if (arr_s[i] == arr_p[now_p]) {
                now_p++
                console.log(1);
                
                continue
            }
            if (arr_p[now_p] == ".") {
                now_p++
                console.log(2);

                continue
            }
            //上面已經排除字母一樣跟字母對應.了，後面直接對應的是字母不同且不為點的狀況，基本上就只有*
            if (arr_p[now_p-1] == "."||arr_p[now_p-1] ==arr_s[i]) {//這兩種是前一個正確延續的狀態，選擇不前進---但須要解決下一個不合的問題
                console.log(3);
                continue
            }
            if(arr_p[now_p]=="*"&&arr_p[now_p+1]==arr_s[i]){
                now_p+=2
                console.log(4);

                continue
            }
            console.log('1');
            
            ans = false
        }


        return ans
    }


    useEffect(() => {
        if (test_case != "") {
            setAns(testFn(test_case))
        }

    }, [test_case])


    ///按照位數去除-得到的數字MATH.floor就是那一位數，考慮直接做一個代換把最小位數去變成最大位還是用比較的
    //代換應該比較簡單

    return (
        <div>
            <h3>test case</h3>
            {
                test_case_.map((item, index) => {
                    return (<>

                        <div key={index}>
                            <span>{item[0]},</span>
                            <span style={{ "marginRight": "30px" }}>{item[1]} </span>
                            <span > {testFn(item[0], item[1]) ? "true" : "false"}</span>
                        </div>
                    </>
                    )
                })
            }
            <br />
            <input type="text" id="test_case" onBlur={(e) => setTest_case(e.target.value)}></input>



            <h3>ans</h3>

            <span>{ans ? "true" : "false"}</span>

        </div>
    )
}
export default Leetcode;
