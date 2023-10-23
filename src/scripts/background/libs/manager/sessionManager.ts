import accessManager from './accessManager';

export class TabSession {
  origin = '';
  icon = '';
  name = '';
  constructor(data) {
    if (data) {
      this.setAttributes(data);
    }
  }
  setAttributes({ origin, icon, name }) {
    this.origin = origin;
    this.icon = icon;
    this.name = name;
  }
}

const sessionObj = {};

const getSession = (id) => {
  return sessionObj[id];
};

const getOrCreateSession = (id) => {
  if (sessionObj[id]) {
    return getSession(id);
  }

  return createSession(id, null);
};

const createSession = (id, data) => {
  const session = new TabSession(data);
  sessionObj[id] = session;

  return session;
};

const deleteSession = (id) => {
  delete sessionObj[id];
};

const broadcastRegister = (ev, data?, origin?) => {
  let sessions: any[] = [];
  Object.keys(sessionObj).forEach((key) => {
    const session = sessionObj[key];
    if (accessManager.hasPermission(session.origin)) {
      sessions.push({
        key,
        ...session
      });
    }
  });

  // same origin
  if (origin) {
    sessions = sessions.filter((session) => session.origin === origin);
  }

  sessions.forEach((session) => {
    try {
      session.postMessage?.(ev, data);
    } catch (e) {
      if (sessionObj[session.key]) {
        deleteSession(session.key);
      }
    }
  });
};

export default {
  getSession,
  getOrCreateSession,
  deleteSession,
  broadcastRegister
};
