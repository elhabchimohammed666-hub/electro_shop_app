import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, getApiError } from '../api.js';

export const checkSession = createAsyncThunk('auth/checkSession', async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
});

export const signIn = createAsyncThunk('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.user;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const signUp = createAsyncThunk('auth/signUp', async (details, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', details);
    return data.user;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'loading', error: null },
  reducers: {
    signedOut(state) {
      state.user = null;
      state.status = 'ready';
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(checkSession.rejected, state => {
        state.user = null;
        state.status = 'ready';
      })
      .addCase(signIn.pending, state => {
        state.error = null;
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'ready';
      })
      .addCase(signUp.pending, state => {
        state.error = null;
        state.status = 'loading';
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(signUp.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'ready';
      });
  }
});

export const { signedOut, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
