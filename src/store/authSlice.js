import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isLoggedIn: false,
    user: null
}
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // 這裡定義修改狀態的方法 (Action)
        login: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            alert("您已閒置過久，系統自動登出"); // 這裡可以加個提示
            // 如果需要跳轉回首頁，可以在 App.jsx 裡處理，或者這裡不做處理
        },
    },
})

export const { login,logout } = authSlice.actions
export default authSlice.reducer