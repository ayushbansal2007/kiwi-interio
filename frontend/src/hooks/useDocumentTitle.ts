import { useEffect } from "react";

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;

    return () => {
      document.title = "Kiwi Interio";
    };
  }, [title]);
};

export default useDocumentTitle;