export const hideElement = (selector: string): void => {
  const element = document.querySelector<HTMLElement>(selector);
  console.log(element);
  if (element) {
    element.style.display = "none";
  }
};

export const showElement = (selector: string): void => {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.style.display = "";
  }
};

export const pollForElement = (
  selector,
  callback,
  interval = 500,
  maxAttempts = 10
) => {
  let attempts = 0;
  const intervalId = setInterval(() => {
    const element = document.querySelector(selector);
    if (element || attempts >= maxAttempts) {
      clearInterval(intervalId);
      if (element) {
        callback(element);
      }
    }
    attempts++;
  }, interval);
};
