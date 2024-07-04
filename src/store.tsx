import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  user: null | { [key: string]: any };
  token: null | string;
  employeeId: null | string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: null | string | { [key: string]: any };
  username: null | string;
  role: null | string;
  teamId: number | null;
  officeManagerId: number | null;
  isAdmin: boolean;
  accountStatus?: {
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
  };
}

interface UserData {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  employeeId?: string;
  username: string;
  role: string;
  teamId?: number | null;
  officeManagerId?: number | null;
  isAdmin: boolean;
  accountStatus?: {
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
  };
}

const BASE_URL = 'http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081';

export const registerUser = createAsyncThunk<string, UserData, { rejectValue: string }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/register`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Register User Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk<LoginResponse, UserData, { rejectValue: string }>(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const tokenResponse = await axios.post(`${BASE_URL}/user/token`, {
        username: userData.username,
        password: userData.password,
      });
      const token = tokenResponse.data.split(' ')[1];
      localStorage.setItem('token', token);

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const adminResponse = await axios.get(`${BASE_URL}/user/manage/current-user`, { headers });
        const { username, authorities } = adminResponse.data;
        const role = authorities[0].authority.replace('ROLE_', '');
        const isAdmin = role === 'ADMIN';

        if (isAdmin) {
          return {
            token,
            username,
            role,
            isAdmin,
            accountStatus: {
              accountNonExpired: adminResponse.data.accountNonExpired,
              accountNonLocked: adminResponse.data.accountNonLocked,
              credentialsNonExpired: adminResponse.data.credentialsNonExpired,
              enabled: adminResponse.data.enabled,
            },
          };
        }
      } catch (error) { }

      const userResponse = await axios.get(`${BASE_URL}/user/manage/get?username=${userData.username}`, { headers });
      const { employeeId, username, roles } = userResponse.data;

      let teamId = null;
      let officeManagerId = null;
      if (roles === 'MANAGER') {
        const teamResponse = await axios.get(`${BASE_URL}/employee/team/getbyEmployee?id=${employeeId}`, { headers });
        const teamData = teamResponse.data[0];
        teamId = teamData?.id;
        officeManagerId = teamData?.officeManager?.id;
        localStorage.setItem('teamId', teamId?.toString());
      }

      return { token, employeeId, username, role: roles, teamId, officeManagerId, isAdmin: false };
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
      await axios.post(`${BASE_URL}/user/logout`);
      localStorage.removeItem('token');
      localStorage.removeItem('teamId');
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
  username: null,
  role: null,
  teamId: null,
  officeManagerId: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    setTeamId: (state, action: PayloadAction<number | null>) => {
      state.teamId = action.payload;
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.employeeId = action.payload.employeeId || null;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.teamId = action.payload.teamId || null;
        state.officeManagerId = action.payload.officeManagerId || null;
        state.isAdmin = action.payload.isAdmin;
        state.accountStatus = action.payload.accountStatus;
        localStorage.setItem('role', action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
        state.status = 'succeeded';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { setToken, setRole, setTeamId } = authSlice.actions;
export default authSlice.reducer;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
