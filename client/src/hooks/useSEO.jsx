import { useEffect } from 'react';

/**
 * Custom hook to dynamically set SEO tags for a page.
 * Restores original meta values on component unmount.
 * 
 * @param {Object} seoParams
 * @param {string} seoParams.title - The title tag
 * @param {string} seoParams.description - The meta description
 * @param {string} seoParams.keywords - The meta keywords
 * @param {string} [seoParams.canonical] - The canonical link URL
 */
const useSEO = ({ title, description, keywords, canonical }) => {
  useEffect(() => {
    // Save original title
    const previousTitle = document.title;
    if (title) {
      document.title = title;
    }

    // Helper to update or create a meta tag
    const updateOrCreateMeta = (nameAttr, attrVal, contentVal) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      let originalContent = null;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrVal);
        document.head.appendChild(element);
      } else {
        originalContent = element.getAttribute('content');
      }

      if (contentVal !== undefined && contentVal !== null) {
        element.setAttribute('content', contentVal);
      }

      return { element, originalContent };
    };

    // Helper to update or create the canonical link tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    let originalCanonical = null;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    } else {
      originalCanonical = canonicalElement.getAttribute('href');
    }

    const currentHref = canonical || window.location.href;
    canonicalElement.setAttribute('href', currentHref);

    // Update standard SEO and Social Media tags
    const descData = updateOrCreateMeta('name', 'description', description);
    const keysData = updateOrCreateMeta('name', 'keywords', keywords);
    const ogTitleData = updateOrCreateMeta('property', 'og:title', title);
    const ogDescData = updateOrCreateMeta('property', 'og:description', description);
    const ogUrlData = updateOrCreateMeta('property', 'og:url', currentHref);
    const twTitleData = updateOrCreateMeta('property', 'twitter:title', title);
    const twDescData = updateOrCreateMeta('property', 'twitter:description', description);
    const twUrlData = updateOrCreateMeta('property', 'twitter:url', currentHref);

    // Cleanup function to restore original tags on unmount
    return () => {
      document.title = previousTitle;
      
      if (descData.originalContent !== null) {
        descData.element.setAttribute('content', descData.originalContent);
      } else if (!description) {
        descData.element.remove();
      }
      
      if (keysData.originalContent !== null) {
        keysData.element.setAttribute('content', keysData.originalContent);
      } else if (!keywords) {
        keysData.element.remove();
      }

      if (ogTitleData.originalContent !== null) {
        ogTitleData.element.setAttribute('content', ogTitleData.originalContent);
      }
      if (ogDescData.originalContent !== null) {
        ogDescData.element.setAttribute('content', ogDescData.originalContent);
      }
      if (ogUrlData.originalContent !== null) {
        ogUrlData.element.setAttribute('content', ogUrlData.originalContent);
      }

      if (twTitleData.originalContent !== null) {
        twTitleData.element.setAttribute('content', twTitleData.originalContent);
      }
      if (twDescData.originalContent !== null) {
        twDescData.element.setAttribute('content', twDescData.originalContent);
      }
      if (twUrlData.originalContent !== null) {
        twUrlData.element.setAttribute('content', twUrlData.originalContent);
      }

      if (originalCanonical !== null) {
        canonicalElement.setAttribute('href', originalCanonical);
      } else {
        canonicalElement.remove();
      }
    };
  }, [title, description, keywords, canonical]);
};

export default useSEO;
