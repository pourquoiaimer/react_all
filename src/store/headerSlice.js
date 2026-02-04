import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    title: "綜合頁面", // 對應你原本的 useState("綜合頁面")
}
export const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {
        // 這裡定義修改狀態的方法 (Action)
        setPageTitle: (state, action) => {
            // 在 RTK 裡，你可以直接修改 state，不用像以前那樣複製物件
            state.title = action.payload;
        },
    },
})

export const { setPageTitle } = headerSlice.actions
export default headerSlice.reducer