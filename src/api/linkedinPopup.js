export function openLinkedinPopup(apiUrl) {
  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open(
      `${apiUrl}/api/auth/linkedin/start`,
      'linkedin_login',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        reject(new Error('Popup closed by user'));
      }
    }, 500);

    const expectedOrigin = new URL(apiUrl).origin;

    const messageListener = (event) => {
      if (event.origin !== expectedOrigin) return;

      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        resolve(event.data.payload);
      }
    };

    window.addEventListener('message', messageListener);
  });
}
