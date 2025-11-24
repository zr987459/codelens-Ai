import { CodeState } from "../types";

// Helper to fix relative URLs
const fixUrl = (relUrl: string | null, baseUrl: URL) => {
  if (!relUrl) return '';
  try {
    // Handle protocol-relative URLs (e.g. //example.com/img.png)
    if (relUrl.startsWith('//')) {
      return baseUrl.protocol + relUrl;
    }
    return new URL(relUrl, baseUrl.toString()).toString();
  } catch (e) {
    return relUrl;
  }
};

// Helper to fix CSS URLs (e.g. background-image: url(...))
const fixCssUrls = (cssText: string, baseUrl: URL) => {
  // Regex to match url('...') url("...") or url(...)
  return cssText.replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, urlVal) => {
    if (!urlVal || urlVal.trim().startsWith('data:') || urlVal.trim().startsWith('#')) return match;
    return `url("${fixUrl(urlVal.trim(), baseUrl)}")`;
  });
};

/**
 * Parses raw HTML string into separated HTML, CSS, and JS.
 * @param htmlContent The raw HTML string
 * @param originUrl Optional source URL for resolving relative paths
 */
export const parseHtmlContent = (htmlContent: string, originUrl: string = 'http://localhost'): CodeState => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const baseUrl = new URL(originUrl);

    // 1. Extract CSS
    let css = '';
    // Process <style> tags
    doc.querySelectorAll('style').forEach(style => {
      let styleContent = style.textContent || '';
      styleContent = fixCssUrls(styleContent, baseUrl);
      css += `/* From <style> */\n${styleContent}\n\n`;
      style.remove(); // Remove after extraction
    });

    // 2. Extract JS
    let js = '';
    doc.querySelectorAll('script').forEach(script => {
      const scriptEl = script as HTMLScriptElement;
      const type = scriptEl.getAttribute('type');

      // Skip non-JS scripts (like application/ld+json, etc)
      if (type && !type.toLowerCase().includes('javascript') && !type.toLowerCase().includes('ecmascript') && type !== 'module') {
          return;
      }

      if (!scriptEl.src && scriptEl.textContent) {
        js += `/* From inline script */\n${scriptEl.textContent}\n\n`;
      } else if (scriptEl.src) {
        // Fix script src to be absolute
        scriptEl.src = fixUrl(scriptEl.getAttribute('src'), baseUrl);
      }
      
      // Remove inline scripts as we extracted them. Keep src scripts in HTML to load via iframe.
      if (!scriptEl.src) script.remove(); 
    });

    // 3. Process HTML (Fix links and images)
    // Images
    doc.querySelectorAll('img').forEach(img => {
      const imgEl = img as HTMLImageElement;
      if (imgEl.src) imgEl.src = fixUrl(imgEl.getAttribute('src'), baseUrl);
      // Handle srcset for responsive images
      if (imgEl.srcset) {
        imgEl.srcset = imgEl.srcset.split(',').map(entry => {
            const parts = entry.trim().split(/\s+/);
            if (parts.length > 0) parts[0] = fixUrl(parts[0], baseUrl);
            return parts.join(' ');
        }).join(', ');
      }
    });

    // Links
    doc.querySelectorAll('a').forEach(a => {
      const anchor = a as HTMLAnchorElement;
      if (anchor.href) anchor.href = fixUrl(anchor.getAttribute('href'), baseUrl);
      anchor.target = '_blank'; // Force open in new tab
    });

    // Stylesheets
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      (link as HTMLLinkElement).href = fixUrl(link.getAttribute('href'), baseUrl);
    });

    // Extract external resources to ensure they are loaded
    const externalStyles = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => link.outerHTML)
      .join('\n');
    
    const externalScripts = Array.from(doc.head.querySelectorAll('script[src]'))
      .map(script => script.outerHTML)
      .join('\n');

    let html = `<!-- Parsed Content -->\n`;
    if (externalStyles) html += `<!-- External Styles -->\n${externalStyles}\n\n`;
    html += doc.body.innerHTML;
    if (externalScripts) html += `\n\n<!-- External Scripts -->\n${externalScripts}`;

    return {
      html: html,
      css: css,
      js: js
    };
  } catch (error: any) {
    console.error("Content parsing failed:", error);
    throw new Error(error.message || "解析内容失败");
  }
};

export const fetchWebsite = async (url: string): Promise<CodeState> => {
  // Ensure URL has protocol
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  let htmlContent = '';
  let lastError = null;

  // --- Strategy 1: AllOrigins (JSONP/CORS friendly JSON) ---
  if (!htmlContent) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.contents) htmlContent = data.contents;
      }
    } catch (e) {
      console.warn("Primary proxy (AllOrigins) failed:", e);
      lastError = e;
    }
  }

  // --- Strategy 2: CORSProxy.io (Direct raw content) ---
  if (!htmlContent) {
    try {
      // Note: corsproxy.io usage pattern
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        htmlContent = await response.text();
      }
    } catch (e) {
      console.warn("Secondary proxy (CORSProxy) failed:", e);
      lastError = e;
    }
  }

  // --- Strategy 3: CodeTabs (Direct raw content) ---
  if (!htmlContent) {
      try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
            htmlContent = await response.text();
        }
      } catch (e) {
          console.warn("Tertiary proxy (CodeTabs) failed:", e);
          lastError = e;
      }
  }

  if (!htmlContent) {
    throw new Error(`无法加载该网站。可能原因：目标网站拒绝了代理访问，或者网络不稳定。(${lastError?.message || 'Unknown Error'})`);
  }

  // Use the shared parser
  return parseHtmlContent(htmlContent, url);
};