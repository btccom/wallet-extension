import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotice, useWallet } from '@/ui/utils';

import * as NoticeComponent from './components';

export default function NoticeScreen() {
  const wallet = useWallet();
  const [getNotice, resolveNotice, rejectNotice] = useNotice();

  const [notice, setNotice] = useState<any>(null);

  const navigate = useNavigate();

  const init = async () => {
    const notice = await getNotice();
    if (!notice) {
      navigate('/');
      return null;
    }
    setNotice(notice);
    if (notice.origin || notice.params.origin) {
      document.title = notice.origin || notice.params.origin;
    }
    const account = await wallet.getCurrentAccount();
    if (!account) {
      rejectNotice();
      return;
    }
  };

  useEffect(() => {
    init();
  }, []);
  if (!notice) return <></>;
  const { noticeComponent, params, origin, requestDefer } = notice;
  const CurrentNoticeComponent = NoticeComponent[noticeComponent];
  return <CurrentNoticeComponent params={params} origin={origin} requestDefer={requestDefer} />;
}
