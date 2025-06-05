import { useState ,} from "react";

const Count_text = () => {

    const [text_num, setText_num] = useState(0)

    function count_now(e) {
        let text_now = e.target.value.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '').replaceAll(" ", "")
        setText_num(text_now.length)
    }


    function permAlone(str) {
        let temp_arr = str.split('')
        while (temp_arr.length != 0) {
            temp_arr.splice(0,1)
        }
        return str;
    }

    permAlone('aab');

    return (
        <>
            <div id="text_block">
                <div>現在字數為 {text_num}</div>
                <textarea name="" className="textarea" cols="30" rows="30" onChange={(e) => { count_now(e) }}></textarea>
            </div>
        </>
    )
}
export default Count_text;
