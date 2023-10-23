import { log } from "@/common/log";

const INTERNAL_STAYALIVE_PORT = 'internal-keep-alive';
let alivePort: any = null;

export async function StayAlive() {
  const lastCall = Date.now();
  const wakeup = setInterval(() => {
    const now = Date.now();
    const age = now - lastCall;
    log(`(DEBUG StayAlive) ----------------------- time elapsed: ${age}`);
    if (alivePort == null) {
      alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

      alivePort.onDisconnect.addListener((p) => {
        if (chrome.runtime.lastError) {
          log(`(DEBUG StayAlive) Disconnected due to an error: ${chrome.runtime.lastError.message}`);
        } else {
          log(`(DEBUG StayAlive): port disconnected`);
        }

        alivePort = null;
      });
    }
    if (alivePort) {
      alivePort.postMessage({ content: 'ping' });

      if (chrome.runtime.lastError) {
        log(`(DEBUG StayAlive): postMessage error: ${chrome.runtime.lastError.message}`);
      } else {
        log(`(DEBUG StayAlive): "ping" sent through ${alivePort.name} port`);
      }
    }
    //lastCall = Date.now();
  }, 25000);
}