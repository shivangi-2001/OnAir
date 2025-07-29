import { useEffect } from 'react'

export default function useGoogleTranslate(languages: string = 'en,hi,fr,de,ja') {
  useEffect(() => {
    // check if already initialized
    if ((window as any)._googleTranslateScriptAdded) return

    ;(window as any)._googleTranslateScriptAdded = true

    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)

    ;(window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: languages,
        autoDisplay: false
      }, 'google_translate_element')
    }

    return () => {
      // Optional: remove script if you want
      // document.body.removeChild(script)
    }
  }, [languages])

  const translatePage = (langCode: string) => {
    const select = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null
    if (select) {
      select.value = langCode
      select.dispatchEvent(new Event('change'))
    }
  }

  return { translatePage }
}
