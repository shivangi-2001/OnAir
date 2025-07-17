import { useState } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import useGoogleTranslate from '../hooks/useGoogleTranslate'    

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
];

export default function LanguageSelector() {
  const [selected, setSelected] = useState(languages[0])
  const { translatePage } = useGoogleTranslate('en,hi,fr,de,ja')

  return (
    <Listbox value={selected} onChange={(lang) => {
      setSelected(lang)
      translatePage(lang.code)
    }}>
      <div className="relative mt-2">
        <ListboxButton className="outline-none w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 sm:text-sm">
          <span className="block truncate text-[#4f46e5] font-medium">{selected.name}</span>
          <ChevronDownIcon
            className="pointer-events-none absolute inset-y-1 right-0 mr-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-30 left-0 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {languages.map((lang) => (
            <ListboxOption
              key={lang.code}
              value={lang}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
            >
              {({ selected }) => (
                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                  {lang.name}
                </span>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
