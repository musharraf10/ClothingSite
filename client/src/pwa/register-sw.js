function dispatchWindowEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function requestServiceWorkerVersion(worker) {
  if (!worker) return;
  worker.postMessage({ type: "GET_SW_VERSION" });
}

function notifyUpdateAvailable(registration) {
  dispatchWindowEvent("sw:update-available", {
    registration,
  });
}

export function activateWaitingServiceWorker(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      // Temporarily disable PWA service worker and clean existing registrations.
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
      console.error("SW unregister failed", error);
    }
  });
}
