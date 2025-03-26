export const hideElement = (selector: string): void => {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  console.log("hide\t", elements);

  if (elements.length > 0) {
    elements.forEach((element) => {
      element.style.display = "none";
    });
  }
};

export const showElement = (selector: string): void => {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  console.log("show\t", elements);

  if (elements.length > 0) {
    elements.forEach((element) => {
      element.style.display = "";
    });
  }
};

export const pollForElement = (
  selector,
  callback,
  interval = 500,
  maxAttempts = 5
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
    console.log("polling");
    attempts++;
  }, interval);
};
