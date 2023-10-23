import { useCallback, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useNavigate as useNavigateOrigin } from 'react-router-dom';

import { Icon, LoadingIcon } from './components';
import HomePage from './pages/Home/HomePage';
import InscriptionPage from './pages/Home/InscriptionPage';
import InvalidIntroducePage from './pages/Home/InvalidIntroducePage';
import ServicePage from './pages/Home/ServicePage';
import SettingsPage from './pages/Home/SettingsPage';
import WelcomePage from './pages/Home/WelcomePage';
import NoticePage from './pages/Notice/NoticePage';
import ConnectedPage from './pages/Security/ConnectedPage';
import SetPasswordPage from './pages/Security/SetPassword';
import UnlockPage from './pages/Security/UnlockPage';
import AddressTypePage from './pages/Settings/AddressTypePage';
import ChangePasswordPage from './pages/Settings/ChangePasswordPage';
import EditWalletNamePage from './pages/Settings/EditWalletNamePage';
import NetworkTypePage from './pages/Settings/NetworkTypePage';
import ViewMnemonicPage from './pages/Settings/ViewMnemonicPage';
import StartupPage from './pages/StartupPage';
import BRC20SendPage from './pages/Transaction/Inscriptions/BRC20SendPage';
import BRC20TickPage from './pages/Transaction/Inscriptions/BRC20TickPage';
import BRC20TransferPage from './pages/Transaction/Inscriptions/BRC20TransferPage';
import { InscribeTransferScreen } from './pages/Transaction/Inscriptions/InscribeTransfer';
import InscriptionsDetailPage from './pages/Transaction/Inscriptions/InscriptionsDetailPage';
import InscriptionsTxCreatePage from './pages/Transaction/Inscriptions/InscriptionsTxCreatePage';
import TxCreatePage from './pages/Transaction/Normal/TxCreatePage';
import ReceiveScreen from './pages/Transaction/ReceivePage';
import SpSatsDetailPage from './pages/Transaction/Sats/SpsatsDetailPage';
import SpsatsTxConfirmPage from './pages/Transaction/Sats/SpsatsTxConfirmPage';
import SpsatsTxCreatePage from './pages/Transaction/Sats/SpsatsTxCreatePage';
import { SignHexPage } from './pages/Transaction/SignHex/SignHexPage';
import TxFailPage from './pages/Transaction/TxFailPage';
import TxPasswordConfirmPage from './pages/Transaction/TxPasswordConfirmPage';
import TxSuccessPage from './pages/Transaction/TxSuccessPage';
import AddWalletPage from './pages/Wallet/AddWalletPage';
import CreateAccountPage from './pages/Wallet/CreateAccountPage';
import CreateHDWalletPage from './pages/Wallet/CreateHDWalletPage';
import EditAccountNamePage from './pages/Wallet/EditAccountNamePage';
import ExportPrivateKeyPage from './pages/Wallet/ExportPrivateKeyPage';
import ImportSimpleWallet from './pages/Wallet/ImportSimpleWallet';
import SwitchAccountPage from './pages/Wallet/SwitchAccountPage';
import SwitchWalletPage from './pages/Wallet/SwitchWalletPage';
import { useIsReady, useIsUnlocked } from './store/common/hook';
import { commonActions } from './store/common/reducer';
import { useAppDispatch } from './store/hooks';
import { uiActions } from './store/ui/reducer';
import { useWallet } from './utils';

const routes = {
  StartupPage: {
    path: '/',
    element: <StartupPage />
  },
  Welcome: {
    path: '/welcome',
    element: <WelcomePage />
  },
  UnlockPage: {
    path: '/unlock',
    element: <UnlockPage />
  },
  HomePage: {
    path: '/home',
    element: <HomePage />
    // element: <WalletTabScreen />
  },
  InscriptionPage: {
    path: '/inscription',
    element: <InscriptionPage />
  },
  ServicePage: {
    path: '/service',
    element: <ServicePage />
  },
  SettingsPage: {
    path: '/settings',
    element: <SettingsPage />
  },
  CreateHDWalletPage: {
    path: '/wallet/create-hd-wallet',
    element: <CreateHDWalletPage />
  },
  CreateAccountPage: {
    path: '/wallet/create',
    element: <CreateAccountPage />
  },
  SetPasswordPage: {
    path: '/security/set-password',
    element: <SetPasswordPage />
  },
  SwitchAccountPage: {
    path: '/wallet/switch-account',
    element: <SwitchAccountPage />
  },
  ReceiveScreen: {
    path: '/wallet/receive',
    element: <ReceiveScreen />
  },

  TxCreatePage: {
    path: '/wallet/tx/create',
    element: <TxCreatePage />
  },
  TxPasswordConfirmPage: {
    path: '/transaction/password/confirm',
    element: <TxPasswordConfirmPage />
  },
  TxSuccessPage: {
    path: '/transaction/tx/success',
    element: <TxSuccessPage />
  },
  TxFailPage: {
    path: '/transaction/tx/fail',
    element: <TxFailPage />
  },

  InscriptionsDetailPage: {
    path: '/wallet/ordinals-detail',
    element: <InscriptionsDetailPage />
  },

  InscriptionsTxCreatePage: {
    path: '/wallet/ordinals-tx/create',
    element: <InscriptionsTxCreatePage />
  },

  SpsatsTxCreatePage: {
    path: '/wallet/spsats-tx/create',
    element: <SpsatsTxCreatePage />
  },

  SpsatsTxConfirmPage: {
    path: '/wallet/spsats-tx/confirm',
    element: <SpsatsTxConfirmPage />
  },
  NetworkTypePage: {
    path: '/settings/network-type',
    element: <NetworkTypePage />
  },
  ChangePasswordPage: {
    path: '/settings/password',
    element: <ChangePasswordPage />
  },
  ExportPrivateKeyPage: {
    path: '/settings/export-privatekey',
    element: <ExportPrivateKeyPage />
  },
  ViewMnemonicPage: {
    path: '/settings/view-mnemonics',
    element: <ViewMnemonicPage />
  },
  NoticePage: {
    path: '/notice',
    element: <NoticePage />
  },
  ConnectedPage: {
    path: '/connected-sites',
    element: <ConnectedPage />
  },
  SwitchWalletPage: {
    path: '/wallet/switch-wallet',
    element: <SwitchWalletPage />
  },
  AddWalletPage: {
    path: '/wallet/add-keyring',
    element: <AddWalletPage />
  },
  EditWalletNamePage: {
    path: '/settings/edit-wallet-name',
    element: <EditWalletNamePage />
  },
  ImportSimpleWallet: {
    path: '/wallet/create-simple-wallet',
    element: <ImportSimpleWallet />
  },
  AddressTypePage: {
    path: '/settings/address-type',
    element: <AddressTypePage />
  },
  EditAccountNamePage: {
    path: '/settings/edit-account-name',
    element: <EditAccountNamePage />
  },
  InscribeTransferScreen: {
    path: '/inscribe/transfer',
    element: <InscribeTransferScreen />
  },
  BRC20TransferPage: {
    path: '/transaction/inscription/brc20/transfer',
    element: <BRC20TransferPage />
  },
  BRC20TickPage: {
    path: '/transaction/inscription/brc20/token',
    element: <BRC20TickPage />
  },
  BRC20SendPage: {
    path: '/transaction/inscription/brc20/send',
    element: <BRC20SendPage />
  },
  SignHexPage: {
    path: '/sign-hex',
    element: <SignHexPage />
  },
  SpSatsDetailPage: {
    path: '/transaction/sats/detail',
    element: <SpSatsDetailPage />
  },
  InvalidIntroducePage: {
    path: '/invalid-introduce',
    element: <InvalidIntroducePage />
  }
};

export type RouteTypes = keyof typeof routes;

export function useNavigate() {
  const navigate = useNavigateOrigin();
  return useCallback(
    (routKey: RouteTypes, state?: any) => {
      navigate(routes[routKey].path, { state });
    },
    [useNavigateOrigin]
  );
}

const Main = () => {
  const wallet = useWallet();
  const dispatch = useAppDispatch();

  const isReady = useIsReady();
  const isUnlocked = useIsUnlocked();

  const selfRef = useRef({
    settingsLoaded: false,
    accountLoaded: false,
    configLoaded: false
  });
  const self = selfRef.current;
  const init = useCallback(async () => {
    try {
      if (!self.accountLoaded) {
        const currentAccount = await wallet.getCurrentAccount();
        if (currentAccount) {
          dispatch(uiActions.setCurrentAccount(currentAccount));

          const accounts = await wallet.getAccounts();
          dispatch(uiActions.setAccounts(accounts));

          if (accounts.length > 0) {
            self.accountLoaded = true;
          }
        }
      }

      if (!self.settingsLoaded) {
        const networkType = await wallet.getNetworkType();
        dispatch(
          uiActions.updateSettings({
            networkType
          })
        );

        self.settingsLoaded = true;
      }

      dispatch(commonActions.update({ isReady: true }));
    } catch (e) {
      console.log('init error', e);
    }
  }, [dispatch, wallet, isReady, isUnlocked]);

  useEffect(() => {
    wallet.hasVault().then((val) => {
      if (val) {
        wallet.isUnlocked().then((isUnlocked) => {
          dispatch(commonActions.update({ isUnlocked }));
          if (!isUnlocked && location.href.includes(routes.UnlockPage.path) === false) {
            const basePath = location.href.split('#')[0];
            location.href = `${basePath}#${routes.UnlockPage.path}`;
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  if (!isReady) {
    return (
      <div className="container">
        <div className="view justify-center items-center">
          <Icon>
            <LoadingIcon />
          </Icon>
        </div>
      </div>
    );
  }
  return (
    <HashRouter>
      <Routes>
        {Object.keys(routes)
          .map((v) => routes[v])
          .map((v) => (
            <Route key={v.path} path={v.path} element={v.element} />
          ))}
      </Routes>
    </HashRouter>
  );
};

export default Main;
