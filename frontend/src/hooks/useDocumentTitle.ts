import { useEffect } from 'react';

// 🔥 Yahan title: string likh kar type-safety de di
function useDocumentTitle(title: string): void {
  useEffect(() => {
    // 1. Browser ka Title badlo
    document.title = `${title} | Kiwi Interiors`;

    // 2. Browser ka Favicon (Logo) dynamic set/update karo
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    
    // Agar head me pehle se icon tag nahi hai, toh naya banao
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    link.type = 'image/png'; 
    
    // 🔥 Yahan apna online logo ka link paste kar do
    link.href = 'https://www.kiwiinterio.com/images/logo-kiwi-1.png'; 

  }, [title]); // Jab bhi title badlega, ye chalega
}

export default useDocumentTitle;