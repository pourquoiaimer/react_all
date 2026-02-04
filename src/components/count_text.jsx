import { useEffect, useState, useContext } from "react";
// import { useDispatch } from "react-redux";
import { setPageTitle } from "../store/headerSlice"; // 引入我們定義的 Action
// import { AllData } from "../App";

const Count_text = () => {
  // const { setNowShow } = useContext(AllData);
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   // 2. 發送 Action 來修改 Redux 裡的 title
  //   // 這裡傳入的 "字數計算" 會變成 action.payload
  //   dispatch(setPageTitle("字數計算"));

  //   // 組件卸載時(離開這頁)，你可以選擇是否要改回預設標題，或是在 Home 頁面設回來
  //   return () => dispatch(setPageTitle("綜合頁面")); 
  // }, [dispatch]);

  const [text_num, setText_num] = useState(0);

  // useEffect(() => {
  //   setNowShow("字數計算");
  // }, [setNowShow]);

  function count_now(e) {
    let text_now = e.target.value
      .replace(/(\n[\s\t]*\r*\n)/g, "\n")
      .replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, "")
      .replaceAll(" ", "");
    setText_num(text_now.length);
  }

  function permAlone(str) {
    let temp_arr = str.split("");
    while (temp_arr.length != 0) {
      temp_arr.splice(0, 1);
    }
    return str;
  }

  permAlone("aab");

  return (
    <>
      <div id="text_block">
        <div>現在字數為 {text_num}</div>
        <textarea
          name=""
          className="textarea"
          cols="30"
          rows="30"
          onChange={(e) => {
            count_now(e);
          }}
        ></textarea>
      </div>
    </>
  );
};
export default Count_text;
