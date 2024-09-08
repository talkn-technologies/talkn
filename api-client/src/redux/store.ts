import { configureStore } from '@reduxjs/toolkit';

import apiMiddlewares from '@api-client/redux/middleware';
import apiReducers from '@api-client/redux/reducers';

declare global {
  interface Module {
    hot: any;
  }
}

export type ReduxState = ReturnType<typeof apiReducers>;
export type ReduxStateKeys = keyof ReduxState;
export type ApiStore = ReturnType<typeof configureStore>;

const apiStore = configureStore({
  reducer: apiReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiMiddlewares),
});

export const createApiStore = () => {
  return configureStore({
    reducer: apiReducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiMiddlewares),
  });
};

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('@api-client/redux/reducers', () => {
    const newRootReducer = require('@api-client/redux/reducers').default;
    apiStore.replaceReducer(newRootReducer);
  });
}

export default apiStore;
