import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import '@/ui/styles/global.less';

import Router from './router';
import store from './store';
import StoreUpdate from './store/storeUpdate';
import { WalletProvider } from './utils';
import { HelperProvider } from './utils/HelperContext';
import { wallet } from './backgroundapi';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Provider store={store}>
    <WalletProvider wallet={wallet as any}>
      <HelperProvider>
        <StoreUpdate />
        <Router />
      </HelperProvider>
    </WalletProvider>
  </Provider>
);
