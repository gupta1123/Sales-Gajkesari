import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

import { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {

  user: null | { [key: string]: any };

  token: null | string;

  status: 'idle' | 'loading' | 'succeeded' | 'failed';

  error: null | string | { [key: string]: any };

}

interface UserData {

  username: string;

  password: string;

  // Add other properties as needed

}

export const registerUser = createAsyncThunk<string, UserData, { rejectValue: string }>(

  'auth/register',

  async (userData, { rejectWithValue }) => {

    try {

      const response = await axios.post(

        'http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/user/register',

        userData

      );

      return response.data;

    } catch (error: any) {

      console.error('Register User Error:', error);

      return rejectWithValue(error.response?.data || error.message);

    }

  }

);

export const loginUser = createAsyncThunk<string, UserData, { rejectValue: string }>(
  'auth/login',
  async (userData, { rejectWithValue }) => {

    try {

      const response = await axios.post(

        'http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/user/token',

        {

          username: userData.username,

          password: userData.password,

        }

      );

      const token = response.data.split(' ')[1];

      localStorage.setItem('token', token); // Store the token in localStorage

      return token;

    } catch (error: any) {

      console.error('Login User Error:', error);

      return rejectWithValue(error.response?.data || error.message);

    }

  }

);

const initialState: AuthState = {

  user: null,

  token: null,

  status: 'idle',

  error: null,

};

const authSlice = createSlice({

  name: 'auth',

  initialState,

  reducers: {

    logout: (state) => {

      state.user = null;

      state.token = null;

      localStorage.removeItem('token');

    },

    checkStoredToken: (state) => {

      const storedToken = localStorage.getItem('token');

      if (storedToken) {

        state.token = storedToken;

        state.status = 'succeeded';

      }

    },

  },

  extraReducers: (builder) => {

    builder

      .addCase(registerUser.pending, (state) => {

        state.status = 'loading';

      })

      .addCase(registerUser.fulfilled, (state, action: PayloadAction<string>) => {

        state.status = 'succeeded';

        state.token = action.payload;

      })

      .addCase(registerUser.rejected, (state, action) => {

        state.status = 'failed';

        state.error = action.payload || 'Unknown error';

      })

      .addCase(loginUser.pending, (state) => {

        state.status = 'loading';

      })

      .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {

        state.status = 'succeeded';

        state.token = action.payload;

      })

      .addCase(loginUser.rejected, (state, action) => {

        state.status = 'failed';

        state.error = action.payload || 'Unknown error';

      });

  },

});

export const { logout, checkStoredToken } = authSlice.actions;

export default authSlice.reducer;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,

  },

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;