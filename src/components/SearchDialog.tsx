import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';

// Define the shape of your search data
interface SearchItem {
  title: string;
  description: string;
  url: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<SearchItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [results, setResults] = useState<SearchItem[]>([]);

  // Define the initial links to display when the query is empty
  const initialLinks = [
    { title: 'About', url: '/' },
    { title: 'Projects', url: '/projects' },
    { title: 'Tools', url: '/tools' },
    { title: 'Blog', url: '/blog' },
    { title: 'Contact', url: '/contact' },
  ];

  // Keyboard shortcut to open the dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch the search index and initialize Fuse.js
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/search.json');
        const searchData = await response.json();
        setData(searchData);

        const fuseOptions = {
          keys: ['title', 'description', 'url', 'content'],
          threshold: 0.3,
          includeScore: true,
          ignoreLocation: true,
        };
        setFuse(new Fuse(searchData, fuseOptions));
      } catch (error) {
        console.error('Failed to fetch search data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle search query changes and perform search
  useEffect(() => {
    if (fuse && query) {
      const fuseResults = fuse.search(query).map(result => result.item);
      setResults(fuseResults);
    } else {
      // Clear results when the query is empty to show the initial links
      setResults([]); 
    }
  }, [query, fuse]); 

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 gap-1.5 rounded-full px-2.5 select-none border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="w-4 h-4" />
        <kbd className="pointer-events-none h-5 min-w-6 items-center justify-center gap-1 rounded-sm bg-black/5 px-1 font-sans text-[13px] font-normal text-muted-foreground shadow-[inset_0_-1px_2px] shadow-black/10 select-none dark:bg-white/10 dark:shadow-white/10 dark:text-shadow-xs [&amp;_svg:not([class*='size-'])]:size-3 tracking-wider sm:in-[.os-macos_&amp;]:flex">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} modal={false} className="top-[10vh] translate-y-0 sm:top-[10vh]">
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput
            placeholder="Search for something..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query === '' ? (
              // Display initial links when the query is empty
              <CommandGroup heading="Pages">
                {initialLinks.map((item) => (
                  <CommandItem
                    key={item.url}
                    onSelect={() => {
                      window.location.href = item.url;
                      setOpen(false);
                    }}
                    className="truncate"
                  >
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              // Display search results when a query is present
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Results">
                  {results.map((item) => (
                    <CommandItem
                      key={item.url}
                      onSelect={() => {
                        window.location.href = item.url;
                        setOpen(false);
                      }}
                      className="truncate"
                    >
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}