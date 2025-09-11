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
          threshold: 0.3, // Adjust this value for fuzziness, 
          includeScore: true, // Useful for debugging and sorting
          ignoreLocation: true, // Ensures words in the middle of long content are found
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
      // DEBUG: Log the query value to ensure it's not empty
      console.log("Searching for query:", query);
      
      const fuseResults = fuse.search(query).map(result => result.item);
      
      // DEBUG: Log the results to see what Fuse returns
      console.log("Fuse search results:", fuseResults);
      
      setResults(fuseResults);
    } else {
      // When query is empty, show no results or all items
      setResults(data); // Optionally show all data when query is empty
    }
  }, [query, fuse, data]); // Ensure dependencies are correct

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 gap-1.5 rounded-full bg-zinc-50 px-2.5 text-muted-foreground select-none hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-900 not-dark:border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15"
      >
        <Search className="w-4 h-4" />
        <kbd className="pointer-events-none h-5 min-w-6 items-center justify-center gap-1 rounded-sm bg-black/5 px-1 font-sans text-[13px] font-normal text-muted-foreground shadow-[inset_0_-1px_2px] shadow-black/10 select-none dark:bg-white/10 dark:shadow-white/10 dark:text-shadow-xs [&amp;_svg:not([class*='size-'])]:size-3 tracking-wider sm:in-[.os-macos_&amp;]:flex">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} modal={false}>
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput
            placeholder="Search for something..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
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
            {/* Optional: Add a list of all items when query is empty */}
            {query === '' && (
              <>
                <CommandSeparator />
                <CommandGroup heading="All Pages">
                  {data.slice(0, 10).map((item) => (
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