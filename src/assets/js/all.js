import html2canvas from "html2canvas";



export function get_block(id) {
    console.log(id);
    html2canvas(document.querySelector(`#${id}`)).then(canvas => {
        let a = document.createElement('a')
        a.href = canvas.toDataURL('image/jpeg', 0.92).replace("image/jpeg", "image/octet-stream")
        a.download = 'image.jpg'
        a.click()
        // document.querySelector(`#${id}`).appendChild(canvas)
    });
}