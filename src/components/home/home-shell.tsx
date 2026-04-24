"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogAutocompleteField } from "@/components/home/catalog-autocomplete-field";
import { appConfig } from "@/lib/app-config";
import {
  createUserCatalogBrand,
  createUserCatalogItem,
  findBrandByExactName,
  findItemByExactName,
  mergeCatalogStores,
  searchBrands,
  searchItems,
  type CatalogBrand,
  type CatalogItem,
  type CatalogStore,
  type CatalogSuggestion
} from "@/lib/catalog";
import { seedCatalog } from "@/lib/catalog-seed";
import { homeFilters, homeSorts } from "@/lib/domain";

type View = "home" | "picker" | "form";
type Category = "cigar" | "pipe" | "spirits";
type EntryMode = "quick" | "full";

type PipeRatings = {
  flavor: number;
  strength: number;
  roomNote: number;
  performance: number;
  enjoyment: number;
  tin: number;
  mechanics: number;
};

type PipeFormState = {
  brand: string;
  blendName: string;
  date: string;
  setting: string;
  location: string;
  pipeUsed: string;
  lighterUsed: string;
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  tinNotes: string;
  yearBlended: string;
  prepNotes: string;
};

type PipeEntry = {
  id: string;
  category: "pipe";
  brandId: string | null;
  blendId: string | null;
  catalogSource: "seed" | "user" | "manual";
  brand: string;
  blendName: string;
  date: string;
  timeOfDay: string;
  setting: string;
  location: string;
  pipeUsed: string;
  lighterUsed: string;
  blendType: string;
  cutType: string;
  nicotineStrength: string;
  components: string[];
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  tinNotes: string;
  yearBlended: string;
  prepNotes: string;
  ratings: PipeRatings;
  suggestedScore: number;
  createdAt: string;
};

const PIPE_ENTRIES_KEY = "finders-log.pipe.entries";
const PIPE_DRAFT_KEY = "finders-log.pipe.draft";
const USER_CATALOG_KEY = "finders-log.catalog.user.v1";

const defaultPipeForm: PipeFormState = {
  brand: "",
  blendName: "",
  date: "",
  setting: "",
  location: "",
  pipeUsed: "",
  lighterUsed: "",
  quickNotes: "",
  firstThirdNotes: "",
  middleThirdNotes: "",
  finalThirdNotes: "",
  tinNotes: "",
  yearBlended: "",
  prepNotes: ""
};

const defaultPipeRatings: PipeRatings = {
  flavor: 0,
  strength: 0,
  roomNote: 0,
  performance: 0,
  enjoyment: 0,
  tin: 0,
  mechanics: 0
};

const pickerItems: Array<{
  key: Category;
  label: string;
  sub: string;
  image: string;
  title: string;
}> = [
  {
    key: "cigar",
    label: "Cigar",
    sub: "Premium cigars & sessions",
    image: "/cigar.png",
    title: "New Cigar Session"
  },
  {
    key: "pipe",
    label: "Pipe",
    sub: "Blends, bowls & tasting notes",
    image: "/pipe.png",
    title: "New Pipe Session"
  },
  {
    key: "spirits",
    label: "Spirits",
    sub: "Whiskey, bourbon & beyond",
    image: "/whiskey.png",
    title: "New Spirits Session"
  }
];

function normalizedWeightedScore(fields: Array<[number, number]>) {
  const valid = fields.filter(([value]) => value > 0);
  if (!valid.length) return 0;

  const totalWeight = valid.reduce((sum, [, weight]) => sum + weight, 0);
  const score = valid.reduce((sum, [value, weight]) => sum + (value * weight) / totalWeight, 0);
  return Math.round(score * 10) / 10;
}

export function HomeShell() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState<Category>("cigar");
  const [entryMode, setEntryMode] = useState<EntryMode>("quick");
  const [pipeTimeOfDay, setPipeTimeOfDay] = useState("Evening");
  const [pipeBlendType, setPipeBlendType] = useState("English");
  const [pipeCutType, setPipeCutType] = useState("Ribbon");
  const [pipeNicotineStrength, setPipeNicotineStrength] = useState("Medium");
  const [pipeComponents, setPipeComponents] = useState<string[]>(["Latakia", "Orientals"]);
  const [pipeForm, setPipeForm] = useState<PipeFormState>(defaultPipeForm);
  const [pipeEntries, setPipeEntries] = useState<PipeEntry[]>([]);
  const [userCatalog, setUserCatalog] = useState<CatalogStore>({ brands: [], items: [] });
  const [pipeRatings, setPipeRatings] = useState<PipeRatings>(defaultPipeRatings);
  const [pipeRatingHover, setPipeRatingHover] = useState<Partial<Record<keyof PipeRatings, number>>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const activePickerItem = pickerItems.find((item) => item.key === selectedCategory) ?? pickerItems[0];
  const catalogStore = useMemo(() => mergeCatalogStores(seedCatalog, userCatalog), [userCatalog]);
  const activePipeBrand = useMemo(
    () => findBrandByExactName(catalogStore, "pipeTobaccos", pipeForm.brand),
    [catalogStore, pipeForm.brand]
  );

  const pipeBrandSuggestions = useMemo(
    () => searchBrands(catalogStore, "pipeTobaccos", pipeForm.brand),
    [catalogStore, pipeForm.brand]
  );

  const pipeBlendSuggestions = useMemo(
    () =>
      searchItems(catalogStore, "pipeTobaccos", pipeForm.blendName, {
        brandId: activePipeBrand?.id ?? undefined
      }),
    [activePipeBrand?.id, catalogStore, pipeForm.blendName]
  );

  const pipeSuggestedScore = useMemo(() => {
    return normalizedWeightedScore([
      [pipeRatings.flavor, 0.28],
      [pipeRatings.enjoyment, 0.22],
      [pipeRatings.performance, 0.18],
      [pipeRatings.roomNote, 0.12],
      [pipeRatings.mechanics, 0.1],
      [pipeRatings.tin, 0.06],
      [pipeRatings.strength, 0.04]
    ]);
  }, [pipeRatings]);

  useEffect(() => {
    setIsHydrated(true);

    try {
      const rawEntries = window.localStorage.getItem(PIPE_ENTRIES_KEY);
      if (rawEntries) {
        setPipeEntries(JSON.parse(rawEntries) as PipeEntry[]);
      }
    } catch (error) {
      console.error("Failed to load saved pipe entries", error);
    }

    try {
      const rawDraft = window.localStorage.getItem(PIPE_DRAFT_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as {
          form: PipeFormState;
          timeOfDay: string;
          blendType: string;
          cutType: string;
          nicotineStrength: string;
          components: string[];
          ratings: PipeRatings;
          entryMode: EntryMode;
        };
        setPipeForm({ ...defaultPipeForm, ...draft.form });
        setPipeTimeOfDay(draft.timeOfDay || "Evening");
        setPipeBlendType(draft.blendType || "English");
        setPipeCutType(draft.cutType || "Ribbon");
        setPipeNicotineStrength(draft.nicotineStrength || "Medium");
        setPipeComponents(draft.components || ["Latakia", "Orientals"]);
        setPipeRatings({ ...defaultPipeRatings, ...draft.ratings });
        setEntryMode(draft.entryMode || "quick");
      }
    } catch (error) {
      console.error("Failed to load pipe draft", error);
    }

    try {
      const rawCatalog = window.localStorage.getItem(USER_CATALOG_KEY);
      if (rawCatalog) {
        const parsed = JSON.parse(rawCatalog) as CatalogStore;
        setUserCatalog({
          brands: parsed.brands ?? [],
          items: parsed.items ?? []
        });
      }
    } catch (error) {
      console.error("Failed to load user catalog", error);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const draft = {
      form: pipeForm,
      timeOfDay: pipeTimeOfDay,
      blendType: pipeBlendType,
      cutType: pipeCutType,
      nicotineStrength: pipeNicotineStrength,
      components: pipeComponents,
      ratings: pipeRatings,
      entryMode
    };

    try {
      window.localStorage.setItem(PIPE_DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save pipe draft", error);
    }
  }, [
    isHydrated,
    pipeForm,
    pipeTimeOfDay,
    pipeBlendType,
    pipeCutType,
    pipeNicotineStrength,
    pipeComponents,
    pipeRatings,
    entryMode
  ]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(PIPE_ENTRIES_KEY, JSON.stringify(pipeEntries));
    } catch (error) {
      console.error("Failed to persist pipe entries", error);
    }
  }, [isHydrated, pipeEntries]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(USER_CATALOG_KEY, JSON.stringify(userCatalog));
    } catch (error) {
      console.error("Failed to persist user catalog", error);
    }
  }, [isHydrated, userCatalog]);

  function updatePipeField<K extends keyof PipeFormState>(key: K, value: PipeFormState[K]) {
    setPipeForm((current) => ({ ...current, [key]: value }));
  }

  function resetPipeDraft() {
    setPipeForm(defaultPipeForm);
    setPipeTimeOfDay("Evening");
    setPipeBlendType("English");
    setPipeCutType("Ribbon");
    setPipeNicotineStrength("Medium");
    setPipeComponents(["Latakia", "Orientals"]);
    setPipeRatings(defaultPipeRatings);
    setPipeRatingHover({});
    setEntryMode("quick");
    try {
      window.localStorage.removeItem(PIPE_DRAFT_KEY);
    } catch (error) {
      console.error("Failed to clear pipe draft", error);
    }
  }

  function openNewSession(category: Category) {
    setSelectedCategory(category);
    setView("form");
    if (category !== "pipe") {
      setEntryMode("quick");
    }
  }

  function togglePipeComponent(component: string) {
    setPipeComponents((current) =>
      current.includes(component)
        ? current.filter((item) => item !== component)
        : [...current, component]
    );
  }

  function setPipeRating(key: keyof PipeRatings, value: number) {
    setPipeRatings((current) => ({
      ...current,
      [key]: current[key] === value ? 0 : value
    }));
  }

  function addCustomBrandToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = findBrandByExactName(catalogStore, "pipeTobaccos", trimmedName);
    if (existing) {
      updatePipeField("brand", existing.name);
      return;
    }

    const customBrand = createUserCatalogBrand("pipeTobaccos", trimmedName);
    setUserCatalog((current) => ({
      brands: [customBrand, ...current.brands],
      items: current.items
    }));
    updatePipeField("brand", customBrand.name);
  }

  function addCustomBlendToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const activeBrand = pipeForm.brand.trim()
      ? findBrandByExactName(catalogStore, "pipeTobaccos", pipeForm.brand)
      : null;
    const existing = findItemByExactName(
      catalogStore,
      "pipeTobaccos",
      trimmedName,
      activeBrand?.id ?? undefined
    );

    if (existing) {
      updatePipeField("blendName", existing.name);
      if (existing.brandId) {
        const matchingBrand = catalogStore.brands.find((brand) => brand.id === existing.brandId);
        if (matchingBrand) {
          updatePipeField("brand", matchingBrand.name);
        }
      }
      return;
    }

    let brand = activeBrand;
    if (!brand && pipeForm.brand.trim()) {
      brand = createUserCatalogBrand("pipeTobaccos", pipeForm.brand);
      setUserCatalog((current) => ({
        brands: [brand!, ...current.brands],
        items: current.items
      }));
    }

    const customItem = createUserCatalogItem("pipeTobaccos", trimmedName, brand?.id ?? null, {
      blendFamily: pipeBlendType,
      cutType: pipeCutType
    });

    setUserCatalog((current) => ({
      brands: brand && !current.brands.some((entry) => entry.id === brand!.id) ? [brand!, ...current.brands] : current.brands,
      items: [customItem, ...current.items]
    }));
    updatePipeField("blendName", customItem.name);
    if (brand) {
      updatePipeField("brand", brand.name);
    }
  }

  function selectPipeBrandSuggestion(suggestion: CatalogSuggestion) {
    updatePipeField("brand", suggestion.label);
  }

  function selectPipeBlendSuggestion(suggestion: CatalogSuggestion) {
    const item = catalogStore.items.find((entry) => entry.id === suggestion.id);
    if (!item) {
      updatePipeField("blendName", suggestion.label);
      return;
    }

    updatePipeField("blendName", item.name);

    if (item.brandId) {
      const brand = catalogStore.brands.find((entry) => entry.id === item.brandId);
      if (brand) {
        updatePipeField("brand", brand.name);
      }
    }
  }

  function savePipeEntry() {
    if (!pipeForm.blendName.trim()) {
      window.alert("Please enter a blend name.");
      return;
    }

    const normalizedBrand = pipeForm.brand.trim();
    const normalizedBlend = pipeForm.blendName.trim();
    let resolvedBrand = normalizedBrand
      ? findBrandByExactName(catalogStore, "pipeTobaccos", normalizedBrand)
      : null;
    let resolvedBlend = findItemByExactName(
      catalogStore,
      "pipeTobaccos",
      normalizedBlend,
      resolvedBrand?.id ?? undefined
    );
    let entrySource: PipeEntry["catalogSource"] = "manual";

    const nextUserCatalog = {
      brands: [...userCatalog.brands],
      items: [...userCatalog.items]
    };

    if (normalizedBrand && !resolvedBrand) {
      resolvedBrand = createUserCatalogBrand("pipeTobaccos", normalizedBrand);
      nextUserCatalog.brands.unshift(resolvedBrand);
      entrySource = "user";
    } else if (resolvedBrand) {
      entrySource = resolvedBrand.source;
    }

    if (!resolvedBlend) {
      resolvedBlend = createUserCatalogItem("pipeTobaccos", normalizedBlend, resolvedBrand?.id ?? null, {
        blendFamily: pipeBlendType,
        cutType: pipeCutType,
        components: pipeComponents,
        strength: pipeNicotineStrength
      });
      nextUserCatalog.items.unshift(resolvedBlend);
      entrySource = "user";
    } else {
      entrySource = resolvedBlend.source;
    }

    const entry: PipeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: "pipe",
      brandId: resolvedBrand?.id ?? null,
      blendId: resolvedBlend.id,
      catalogSource: entrySource,
      brand: normalizedBrand,
      blendName: normalizedBlend,
      date: pipeForm.date,
      timeOfDay: pipeTimeOfDay,
      setting: pipeForm.setting.trim(),
      location: pipeForm.location.trim(),
      pipeUsed: pipeForm.pipeUsed.trim(),
      lighterUsed: pipeForm.lighterUsed.trim(),
      blendType: pipeBlendType,
      cutType: pipeCutType,
      nicotineStrength: pipeNicotineStrength,
      components: pipeComponents,
      quickNotes: pipeForm.quickNotes.trim(),
      firstThirdNotes: pipeForm.firstThirdNotes.trim(),
      middleThirdNotes: pipeForm.middleThirdNotes.trim(),
      finalThirdNotes: pipeForm.finalThirdNotes.trim(),
      tinNotes: pipeForm.tinNotes.trim(),
      yearBlended: pipeForm.yearBlended.trim(),
      prepNotes: pipeForm.prepNotes.trim(),
      ratings: pipeRatings,
      suggestedScore: pipeSuggestedScore,
      createdAt: new Date().toISOString()
    };

    setUserCatalog(nextUserCatalog);
    setPipeEntries((current) => [entry, ...current]);
    resetPipeDraft();
    setView("home");
    setSelectedCategory("pipe");
    setActiveFilter("all");
    setActiveSort("newest");
  }

  const visibleEntries = useMemo(() => {
    let entries = [...pipeEntries];

    if (activeFilter === "pipe") {
      entries = entries.filter((entry) => entry.category === "pipe");
    } else if (activeFilter !== "all") {
      entries = [];
    }

    if (searchValue.trim()) {
      const query = searchValue.trim().toLowerCase();
      entries = entries.filter((entry) =>
        [
          entry.brand,
          entry.blendName,
          entry.pipeUsed,
          entry.quickNotes,
          entry.firstThirdNotes,
          entry.middleThirdNotes,
          entry.finalThirdNotes,
          entry.location,
          entry.setting
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (activeSort === "newest") {
      entries.sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt));
    } else if (activeSort === "oldest") {
      entries.sort((a, b) => (a.date || a.createdAt).localeCompare(b.date || b.createdAt));
    } else if (activeSort === "az") {
      entries.sort((a, b) => a.blendName.localeCompare(b.blendName));
    } else if (activeSort === "top") {
      entries.sort((a, b) => b.suggestedScore - a.suggestedScore);
    } else if (activeSort === "faves") {
      entries = [];
    }

    return entries;
  }, [activeFilter, activeSort, pipeEntries, searchValue]);

  return (
    <main className="app-frame">
      <div className="app-shell">
        {view === "home" ? (
          <section className="home-view">
            <header className="home-header">
              <img className="home-logo" src="/LogoFindersLog.png" alt={appConfig.name} />
            </header>

            <section className="home-hero">
              <h1 className="home-hero-headline">{appConfig.tagline}</h1>
              <p className="home-hero-body">
                Your personal journal for pipes, cigars, &amp; spirits.
              </p>
            </section>

            <nav className="filter-tabs" aria-label="Categories">
              {homeFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={activeFilter === filter.value ? "filter-tab active" : "filter-tab"}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </nav>

            <div className="home-hero-image" aria-hidden="true" />

            {searchOpen ? (
              <div className="search-panel">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search blends, brands, notes, tags..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
            ) : null}

            <div className="sort-row" aria-label="Sort options">
              {homeSorts.map((sort) => (
                <button
                  key={sort.value}
                  className={activeSort === sort.value ? "sort-btn active" : "sort-btn"}
                  type="button"
                  onClick={() => setActiveSort(sort.value)}
                >
                  {sort.label}
                </button>
              ))}

              <button
                className="sort-btn sort-icon-btn"
                type="button"
                aria-expanded={searchOpen}
                aria-label="Search entries"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {visibleEntries.length ? (
              <section className="entry-list">
                {visibleEntries.map((entry) => (
                  <article key={entry.id} className="entry-card">
                    <div className="entry-card-main">
                      <span className="entry-badge">
                        <img src="/pipe.png" alt="" />
                      </span>
                      <div className="entry-card-text">
                        <div className="entry-blend">{entry.blendName}</div>
                        <div className="entry-meta">
                          {(entry.date || "No date") + (entry.timeOfDay ? ` · ${entry.timeOfDay}` : "")}
                          {entry.brand ? ` · ${entry.brand}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="entry-score">
                      {entry.suggestedScore.toFixed(1)}
                      <span className="score-denom"> /10</span>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="list-empty">
                <p>
                  {searchValue.trim()
                    ? "No entries match that search yet."
                    : activeSort === "faves"
                      ? "Nothing favorited yet.\nTap ♥ on any entry to save it here."
                      : "Nothing logged yet.\nYour first entry is one smoke away."}
                </p>
                <button className="empty-btn" type="button" onClick={() => setView("picker")}>
                  + Log Your First Session
                </button>
              </section>
            )}
          </section>
        ) : view === "picker" ? (
          <section className="picker-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>New Session</h2>
              <div className="header-spacer" />
            </header>

            <div className="picker-intro">What are you logging today?</div>

            {pickerItems.map((item) => (
              <button
                key={item.key}
                className="picker-card"
                type="button"
                onClick={() => openNewSession(item.key)}
              >
                <div className="picker-emoji">
                  <img src={item.image} alt="" />
                </div>
                <div>
                  <div className="picker-label">{item.label}</div>
                  <div className="picker-sub">{item.sub}</div>
                </div>
                <div className="picker-arrow">›</div>
              </button>
            ))}
          </section>
        ) : (
          <section className="form-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("picker")}
                aria-label="Back to session picker"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>{activePickerItem.title}</h2>
              <div className="header-spacer" />
            </header>

            <section className="form-section mode-panel">
              <div className="mode-toggle">
                <button
                  className={entryMode === "quick" ? "mode-btn active" : "mode-btn"}
                  type="button"
                  onClick={() => setEntryMode("quick")}
                >
                  Quick Entry
                </button>
                <button
                  className={entryMode === "full" ? "mode-btn active" : "mode-btn"}
                  type="button"
                  onClick={() => setEntryMode("full")}
                >
                  Full Entry
                </button>
              </div>
            </section>

            {selectedCategory === "pipe" ? (
              <>
                <section className="form-section">
                  <div className="field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={pipeForm.date}
                      onChange={(event) => updatePipeField("date", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Time of Day</label>
                    <div className="pill-options">
                      {["Morning", "Afternoon", "Evening", "Late Night"].map((option) => (
                        <button
                          key={option}
                          className={pipeTimeOfDay === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => setPipeTimeOfDay(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Setting
                    </div>

                    <div className="field">
                      <label>Setting</label>
                      <input
                        type="text"
                        placeholder="e.g. Back porch, study, cigar lounge..."
                        value={pipeForm.setting}
                        onChange={(event) => updatePipeField("setting", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="City, venue..."
                        value={pipeForm.location}
                        onChange={(event) => updatePipeField("location", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    The Blend
                  </div>

                  <CatalogAutocompleteField
                    label="Brand"
                    value={pipeForm.brand}
                    placeholder="e.g. Peterson, Dunhill, Cornell & Diehl"
                    suggestions={pipeBrandSuggestions}
                    emptyActionLabel={pipeForm.brand.trim() ? `Add "${pipeForm.brand.trim()}" to your brands` : undefined}
                    onChange={(value) => updatePipeField("brand", value)}
                    onSelect={selectPipeBrandSuggestion}
                    onCreateCustom={addCustomBrandToUserCatalog}
                  />

                  <CatalogAutocompleteField
                    label="Blend Name"
                    required
                    value={pipeForm.blendName}
                    placeholder="e.g. Nightcap, Penzance, 1-Q"
                    suggestions={pipeBlendSuggestions}
                    emptyActionLabel={pipeForm.blendName.trim() ? `Add "${pipeForm.blendName.trim()}" to your blends` : undefined}
                    onChange={(value) => updatePipeField("blendName", value)}
                    onSelect={selectPipeBlendSuggestion}
                    onCreateCustom={addCustomBlendToUserCatalog}
                  />

                  {entryMode === "full" ? (
                    <>
                      <div className="field">
                        <label>Style / Family</label>
                        <div className="pill-options">
                          {["Virginia", "VaPer", "English", "Balkan", "Burley", "Aromatic"].map((option) => (
                            <button
                              key={option}
                              className={pipeBlendType === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => setPipeBlendType(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Cut</label>
                        <div className="pill-options">
                          {["Ribbon", "Flake", "Broken Flake", "Coin", "Plug", "Ready Rubbed"].map((option) => (
                            <button
                              key={option}
                              className={pipeCutType === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => setPipeCutType(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Leaf & Components
                    </div>

                    <div className="field">
                      <label>Tobacco Components</label>
                      <div className="pill-options">
                        {["Virginias", "Perique", "Latakia", "Orientals", "Burley", "Cavendish"].map((option) => (
                          <button
                            key={option}
                            className={pipeComponents.includes(option) ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => togglePipeComponent(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Nicotine Strength</label>
                      <div className="pill-options">
                        {["Very Mild", "Mild", "Medium", "Medium-Full", "Full"].map((option) => (
                          <button
                            key={option}
                            className={pipeNicotineStrength === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => setPipeNicotineStrength(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        The Tin
                    </div>

                    <div className="field">
                      <label>Tin Notes — Aroma Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Vanilla, earthy, sweet..."
                        value={pipeForm.tinNotes}
                        onChange={(event) => updatePipeField("tinNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Tin Aroma Rating</label>
                      <div className="flame-rating" onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, tin: 0 }))}>
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={value <= (pipeRatingHover.tin || pipeRatings.tin) ? "flame-btn lit" : "flame-btn"}
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, tin: value }))}
                            onClick={() => setPipeRating("tin", value)}
                            aria-label={`Tin aroma rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Year Blended</label>
                      <input
                        type="text"
                        placeholder="e.g. 2022"
                        value={pipeForm.yearBlended}
                        onChange={(event) => updatePipeField("yearBlended", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Prep Notes</label>
                      <textarea
                        placeholder="e.g. Dried 20 min, rubbed out..."
                        value={pipeForm.prepNotes}
                        onChange={(event) => updatePipeField("prepNotes", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Pipe Used
                  </div>

                  <div className="field">
                    <label>Pipe Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Peterson 999"
                      value={pipeForm.pipeUsed}
                      onChange={(event) => updatePipeField("pipeUsed", event.target.value)}
                    />
                  </div>

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Lighter Used</label>
                      <input
                        type="text"
                        placeholder="e.g. Xikar, Zippo, matches"
                        value={pipeForm.lighterUsed}
                        onChange={(event) => updatePipeField("lighterUsed", event.target.value)}
                      />
                    </div>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Tasting Notes
                    </div>

                    <div className="field">
                      <label>First Third <span className="label-hint">— the light &amp; opening</span></label>
                      <textarea
                        placeholder="First flavors, aroma on the light, initial character..."
                        value={pipeForm.firstThirdNotes}
                        onChange={(event) => updatePipeField("firstThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Middle Third <span className="label-hint">— development</span></label>
                      <textarea
                        placeholder="How does it change and develop..."
                        value={pipeForm.middleThirdNotes}
                        onChange={(event) => updatePipeField("middleThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Final Third <span className="label-hint">— finish</span></label>
                      <textarea
                        placeholder="How does it finish? Any surprises at the end..."
                        value={pipeForm.finalThirdNotes}
                        onChange={(event) => updatePipeField("finalThirdNotes", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src={activePickerItem.image} alt="" />
                      Burn & Mechanics
                    </div>

                    <div className="pill-options">
                      {["Needed Relights", "Tongue Bite", "Gurgling", "Went Out", "Dottle"].map((option) => (
                        <button key={option} className="pill-opt" type="button">
                          {option}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Rate It
                  </div>

                  {[
                    ["Flavor", "Taste, richness, and depth", "flavor"],
                    ["Strength", "Nicotine and body level", "strength"],
                    ["Room Note", "Aroma in the room", "roomNote"],
                    ["Performance", "Burn, comfort, and ease", "performance"],
                    ["Overall Enjoyment", "Total smoking satisfaction", "enjoyment"]
                  ].map(([label, hint, key]) => (
                    <div key={key} className="field">
                      <label>
                        {label} <span className="label-hint">— {hint}</span>
                      </label>
                      <div
                        className="flame-rating"
                        onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, [key]: 0 }))}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={
                              value <= ((pipeRatingHover[key as keyof PipeRatings] || pipeRatings[key as keyof PipeRatings]))
                                ? "flame-btn lit"
                                : "flame-btn"
                            }
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, [key]: value }))}
                            onClick={() => setPipeRating(key as keyof PipeRatings, value)}
                            aria-label={`${label} rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Mechanics Score <span className="label-hint">— Burn, draw, and comfort</span></label>
                      <div
                        className="flame-rating"
                        onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, mechanics: 0 }))}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={value <= (pipeRatingHover.mechanics || pipeRatings.mechanics) ? "flame-btn lit" : "flame-btn"}
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, mechanics: value }))}
                            onClick={() => setPipeRating("mechanics", value)}
                            aria-label={`Mechanics rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Notes
                  </div>

                  <div className="field">
                    <label>{entryMode === "quick" ? "Anything worth remembering?" : "Quick Notes"}</label>
                    <textarea
                      placeholder="Flavors, impressions, context — anything..."
                      value={pipeForm.quickNotes}
                      onChange={(event) => updatePipeField("quickNotes", event.target.value)}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Overall Rating
                  </div>

                  <div className="suggested-score-box">
                    <div className="suggested-score-label">Suggested Score</div>
                    <div className="suggested-score-val">{pipeSuggestedScore.toFixed(1)} / 10</div>
                    <div className="suggested-score-note">Based on your current tasting ratings</div>
                  </div>
                </section>
              </>
            ) : (
              <section className="form-section">
                <>
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    {activePickerItem.label} Session
                  </div>

                  <div className="field">
                    <label>{activePickerItem.label === "Spirits" ? "Name" : "Title"} <span className="req">*</span></label>
                    <input
                      type="text"
                      placeholder={
                        activePickerItem.key === "cigar"
                          ? "e.g. Padron 1964 Anniversary"
                          : "e.g. Eagle Rare 10"
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Date</label>
                    <input type="date" />
                  </div>

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Time of Day</label>
                      <div className="pill-options">
                        {["Morning", "Afternoon", "Evening", "Late Night"].map((option) => (
                          <button key={option} className="pill-opt" type="button">
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="field">
                    <label>Location</label>
                    <input type="text" placeholder="Where are you enjoying it?" />
                  </div>

                  {entryMode === "full" ? (
                    <>
                      <div className="field">
                        <label>{activePickerItem.label === "Spirits" ? "Pairing" : "Companion / Pairing"}</label>
                        <input
                          type="text"
                          placeholder={
                            activePickerItem.key === "cigar"
                              ? "Espresso, bourbon, celebration..."
                              : "Cigar, steak, dessert, or setting..."
                          }
                        />
                      </div>

                      <div className="field">
                        <label>Tasting Notes</label>
                        <textarea placeholder="Open up the full tasting experience here: first impressions, development, texture, finish, and anything memorable..." />
                      </div>
                    </>
                  ) : null}

                  <div className="field">
                    <label>{entryMode === "quick" ? "Quick Notes" : "Overall Thoughts"}</label>
                    <textarea placeholder="First impressions, flavors, setting, and anything worth remembering..." />
                  </div>
                </>
              </section>
            )}

            <button
              className="save-btn"
              type="button"
              onClick={selectedCategory === "pipe" ? savePipeEntry : undefined}
            >
              Save Entry
            </button>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Primary">
          <button
            className={view === "home" ? "bn-tab active" : "bn-tab"}
            type="button"
            onClick={() => setView("home")}
          >
            <svg width="26" height="26" viewBox="0 0 492.308 492.308" fill="currentColor" aria-hidden="true">
              <path d="M483.856,24.067c-77.804-11.16-159.893,1.963-237.703,37.817C168.344,26.041,86.255,12.931,8.452,24.067L0,25.274v408.111l11.24-1.611c75.365-10.774,155.077,2.351,230.385,37.88l0.722,0.355l3.297,2.02l0.416-0.196l0.555,0.273l3.522-2.194l0.344-0.162c75.519-35.625,155.231-48.76,230.587-37.976l11.24,1.611V25.274L483.856,24.067z M236.308,445.635c-56.75-24.63-115.567-37.216-173.183-37.216c-14.567,0-29.067,0.808-43.433,2.428V42.452c71.019-8.447,145.577,4.12,216.615,36.519V445.635z M329.49,53.024c23.187-5.99,46.463-9.914,69.644-11.742v118.752l-34.827-26.12l-34.817,26.115V53.024z M472.615,410.846c-71.096-8.043-145.413,3.913-216.615,34.798V78.971c17.749-8.094,35.719-14.949,53.798-20.548v141l54.51-40.894l54.519,40.889V40.042c18.079-0.496,36.046,0.301,53.788,2.41V410.846z" />
              <path d="M47.471,343l2.788,19.49c49.875-7.115,102.663,1.587,152.673,25.197l8.404-17.808C157.827,344.616,101.135,335.317,47.471,343z" />
              <path d="M47.471,264.063l2.788,19.49c49.875-7.13,102.663,1.587,152.673,25.197l8.404-17.808C157.817,265.668,101.135,256.385,47.471,264.063z" />
              <path d="M47.471,185.125l2.788,19.49c49.875-7.125,102.663,1.582,152.673,25.197l8.404-17.808C157.827,186.736,101.135,177.447,47.471,185.125z" />
              <path d="M47.471,106.188l2.788,19.49c49.885-7.13,102.654,1.572,152.673,25.192l8.404-17.808C157.817,107.798,101.135,98.5,47.471,106.188z" />
            </svg>
            The Log
          </button>

          <button className="bn-log" type="button" onClick={() => setView("picker")}>
            <div className="bn-log-circle">+</div>
            <span className="bn-log-label">Session</span>
          </button>

          <button className="bn-tab" type="button">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Collection
          </button>
        </nav>
      </div>
    </main>
  );
}
