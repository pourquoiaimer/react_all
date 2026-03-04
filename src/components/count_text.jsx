import { useState } from "react";
import { Converter } from "opencc-js";

const Count_text = () => {
  const [text, setText] = useState("");
  const [text_num, setText_num] = useState(0);

  const count_now = (str) => {
    let text_now = str
      .replace(/(\n[\s\t]*\r*\n)/g, "\n")
      .replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, "")
      .replaceAll(" ", "");
    setText_num(text_now.length);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    count_now(e.target.value);
  };

  const handleS2T = async () => {
    const converter = await Converter({
      from: "cn",
      to: "tw",
    });
    const newText = converter(text);
    setText(newText);
    count_now(newText);
  };

  const handleT2S = async () => {
    const converter = await Converter({
把      from: "tw",
      to: "cn",
    });
    const newText = converter(text);
    setText(newText);
    count_now(newText);
  };

  return (
    <>
      <div id="text_block">
        <div>現在字數為 {text_num}</div>
        <textarea
          name=""
          className="textarea"
          cols="30"
          rows="30"
          value={text}
          onChange={handleTextChange}
        ></textarea>
        <button onClick={handleT2S}>繁轉簡</button>
        <button onClick={handleS2T}>簡轉繁</button>
      </div>
    </>
  );
};
export default Count_text;
