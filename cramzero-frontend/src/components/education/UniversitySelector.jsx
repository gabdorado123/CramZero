import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, University } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { API_BASE } from '@/lib/api';

function UniversityLogo({ university, size = 'h-10 w-10' }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = university.logoUrl || university.logo_url;
  return (
    <div className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-100 p-1.5 text-xs font-black text-violet-700 dark:bg-violet-950/50 dark:text-violet-300`}>
      {!failed && logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} /> : <span>{(university.shortName || university.short_name || university.name).slice(0, 3).toUpperCase()}</span>}
    </div>
  );
}

export function UniversitySelector({ value, onChange, id = 'university', compact = false }) {
  const [query, setQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const requestId = useRef(0);
  const loadCatalog = async (search = '') => {
    const normalize = (items) => items.map((item) => ({
      name: item.name,
      city: item.city || '',
      short_name: item.short_name || item.name,
      logo_url: item.logo_url || (item.domains?.[0] ? `https://${item.domains[0]}/favicon.ico` : ''),
    })).filter((item) => item.name);
    const fetchWithTimeout = async (url, timeout = 10000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    };
    const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    const openAlexResponse = await fetchWithTimeout(`https://api.openalex.org/institutions?filter=country_code:PH%2Ctype:education&per-page=50&sort=${search.trim() ? 'relevance_score:desc' : 'display_name'}${searchParam}`);
    if (openAlexResponse.ok) {
      const payload = await openAlexResponse.json();
      const liveCatalog = normalize((payload.results || []).map((item) => ({
        name: item.display_name,
        city: item.geo?.city || '',
        short_name: item.display_name_acronyms?.[0] || item.display_name,
        logo_url: item.image_url || item.image_thumbnail_url || (item.homepage_url ? `${item.homepage_url.replace(/\/+$/, '')}/favicon.ico` : ''),
      })));
      if (liveCatalog.length > 0) return liveCatalog;
    }

    const catalogResponse = await fetchWithTimeout(`${API_BASE}/api/universities/catalog`);
    if (catalogResponse.ok) {
      const catalog = normalize(await catalogResponse.json());
      if (catalog.length > 0) return catalog;
    }
    throw new Error('The live university directory is unavailable. Try again.');
  };

  const refreshCatalog = () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setLoadError('');
    loadCatalog(query)
      .then((data) => {
        if (currentRequestId !== requestId.current) return;
        setUniversities(data);
      })
      .catch((error) => {
        if (currentRequestId !== requestId.current) return;
        console.error('Live university directory unavailable:', error);
        setUniversities([]);
        setLoadError(error.message);
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => refreshCatalog(), query.trim() ? 350 : 0);
    return () => clearTimeout(timer);
  }, [query]);
  const filtered = useMemo(() => universities, [universities]);
  const selected = universities.find((university) => university.name === value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <Input id={id} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Philippine universities..." className="h-11 rounded-xl pl-10" aria-label="Search Philippine universities" />
      </div>
      <div className={`grid w-full min-w-0 max-w-full gap-2 overflow-x-hidden overflow-y-auto rounded-2xl border border-stone-200 p-2 dark:border-zinc-800 ${compact ? 'max-h-44 sm:max-h-48' : 'max-h-48 sm:max-h-56'}`} role="listbox" aria-label="Philippine universities">
        {isLoading && <div className="p-5 text-center text-sm text-stone-500">Refreshing the university list...</div>}
        {!isLoading && loadError && <div className="space-y-3 p-5 text-center text-sm text-rose-600"><p>{loadError}</p><button type="button" onClick={refreshCatalog} className="font-bold underline">Try again</button></div>}
        {!isLoading && filtered.map((university) => {
          const isSelected = university.name === value;
          return (
            <button key={university.name} type="button" role="option" aria-selected={isSelected} onClick={() => onChange(university.name)} className={`flex min-w-0 w-full items-center gap-3 overflow-hidden rounded-xl p-2.5 text-left transition ${isSelected ? 'bg-violet-50 ring-2 ring-violet-500 dark:bg-violet-950/40' : 'hover:bg-stone-50 dark:hover:bg-zinc-800'}`}>
              <UniversityLogo university={{ ...university, shortName: university.short_name }} />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-stone-800 dark:text-zinc-100">{university.name}</span>{university.city && <span className="block text-xs text-stone-500 dark:text-zinc-400">{university.city}</span>}</span>
              {isSelected && <Check size={18} className="shrink-0 text-violet-600" />}
            </button>
          );
        })}
        {!isLoading && !loadError && filtered.length === 0 && <div className="p-5 text-center text-sm text-stone-500">No live Philippine university matches that search.</div>}
      </div>
      {selected && <p className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-300"><University size={14} /> Selected: {selected.short_name || selected.shortName || selected.name}</p>}
    </div>
  );
}

export { UniversityLogo };
