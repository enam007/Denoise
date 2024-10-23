import { useEffect } from "react";

const useWindowLoad = (callback: () => void) => {
  useEffect(() => {
    const handleLoad = () => {
      callback();
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [callback]);
};

export default useWindowLoad;
