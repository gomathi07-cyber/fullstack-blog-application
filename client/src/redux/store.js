import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storageModule from 'redux-persist/lib/storage/index.js';

const storage = storageModule.default || storageModule;

// Log the types of the storage methods to verify they are functions
// console.log('getItem:', typeof storage.getItem);
// console.log('setItem:', typeof storage.setItem);
// console.log('removeItem:', typeof storage.removeItem);

const rootReducer = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
