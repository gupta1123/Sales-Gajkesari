import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | { [key: string]: any };
  token: null | string;
  employeeId: null | string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: null | string | { [key: string]: any };
}

interface UserData {
  username: string;
  password: string;
}

export const registerUser = createAsyncThunk<string, UserData, { rejectValue: string }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/register',
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error('Register User Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk<{ token: string; employeeId: string }, UserData, { rejectValue: string }>(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/token',
        {
          username: userData.username,
          password: userData.password,
        }
      );
      const token = response.data.split(' ')[1];
      localStorage.setItem('token', token);
      const employeeResponse = await axios.get(
        'http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/info',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const employeeId = employeeResponse.data.employeeId;
      return { token, employeeId };
    } catch (error: any) {
      console.error('Login User Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/logout');
      localStorage.removeItem('token');
    } catch (error: any) {
      console.error('Logout User Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  employeeId: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; employeeId: string }>) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.employeeId = action.payload.employeeId;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.employeeId = null;
        state.status = 'succeeded';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { setToken } = authSlice.actions;

export default authSlice.reducer;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 