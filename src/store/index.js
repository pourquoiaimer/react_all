
import { configureStore } from '@reduxjs/toolkit'
import headerReducer from './headerSlice'
import authReducer from './authSlice'

export const store = configureStore({
    reducer: {
        // 這裡定義 state 的結構，以後取值就是 state.header.title
        header: headerReducer,
        auth: authReducer,
    },
})