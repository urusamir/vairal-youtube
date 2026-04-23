import re

with open("src/app/(platform)/dashboard/discover/page.tsx", "r") as f:
    content = f.read()

# Add Slider import
if 'import { Slider }' not in content:
    content = content.replace('from "@/components/ui/select";', 'from "@/components/ui/select";\nimport { Slider } from "@/components/ui/slider";')

# Filter logic rewrite
old_filter_block = re.search(r'const filtered = useMemo\(\(\) => \{.*?return result;\n  \}, \[.*?\]\);', content, re.DOTALL)
if old_filter_block:
    new_filter_logic = '''const filtered = useMemo(() => {
    let result = creatorsWithCategories;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.fullname.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.categories.some((cat) => cat.toLowerCase().includes(q))
      );
    }

    if (showSavedOnly) {
      result = result.filter((c) => savedUsernames.has(c.username));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.some((sc) => c.categories.includes(sc)));
    }

    if (selectedPlatforms.length > 0) {
      result = result.filter((c) => selectedPlatforms.some((p) => {
        if (p === "instagram") return !!c.instagram;
        if (p === "youtube") return !!c.youtube;
        if (p === "tiktok") return !!c.tiktok;
        if (p === "facebook") return !!c.facebook;
        if (p === "snapchat") return !!c.snapchat;
        if (p === "twitter") return !!c.twitter;
        return false;
      }));
    }

    // Followers Min (Slider)
    if (followerMin[0] > 0) {
      result = result.filter((c) => (c.followers ?? 0) >= followerMin[0]);
    }

    // ER Min (Slider)
    if (erMin[0] > 0) {
      result = result.filter((c) => (c.er ?? 0) >= erMin[0]);
    }

    // Credibility Min (Slider)
    if (credibilityMin[0] > 0) {
      // Assuming credibility is in c.quality_score or we mock it if missing
      result = result.filter((c) => {
         const cred = (c as any).follower_credibility ?? (c.er ? c.er * 10 : 50);
         return cred >= credibilityMin[0];
      });
    }

    if (selectedLocations.length > 0) {
      result = result.filter((c) => {
        const haystack = `${c.country ?? ""} ${c.city ?? ""}`.toLowerCase();
        return selectedLocations.some((loc) => {
          const locObj = LOCATIONS.find((l) => l.label === loc);
          return locObj ? locObj.keywords.some((kw) => haystack.includes(kw)) : haystack.includes(loc.toLowerCase());
        });
      });
    }

    if (gender !== "All") {
      result = result.filter((c) => {
         // Assuming c.gender might be string
         if (!c.gender) return false;
         return c.gender.toLowerCase() === gender.toLowerCase();
      });
    }

    // Age
    if (selectedAges.length > 0) {
      result = result.filter((c) => {
        const cAge = (c as any).creator_age_bracket;
        if (!cAge) return false;
        return selectedAges.includes(cAge);
      });
    }

    // Language
    if (selectedLanguages.length > 0) {
      result = result.filter((c) => {
         const langs = (c as any).languages || [];
         return selectedLanguages.some(sl => langs.includes(sl));
      });
    }

    // Interests
    if (selectedInterests.length > 0) {
      result = result.filter((c) => {
         const ints = (c as any).top_interests || [];
         return selectedInterests.some(si => ints.some((ti: any) => ti.interest === si));
      });
    }

    result.sort((a, b) => {
      const va = sortField === "followers" ? (a.followers ?? 0) : (a.er ?? 0);
      const vb = sortField === "followers" ? (b.followers ?? 0) : (b.er ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [search, selectedCategories, selectedPlatforms, followerMin, erMin, credibilityMin, selectedLocations, gender, selectedAges, selectedLanguages, selectedInterests, sortField, sortDir, showSavedOnly, savedUsernames]);'''
    content = content.replace(old_filter_block.group(0), new_filter_logic)

# Replace useEffect deps
content = re.sub(r'useEffect\(\(\) => \{\n    setVisibleCount\(BATCH\);\n  \}, \[.*?\]\);', '''useEffect(() => {
    setVisibleCount(BATCH);
  }, [search, selectedCategories, selectedPlatforms, followerMin, erMin, credibilityMin, selectedLocations, gender, selectedAges, selectedLanguages, selectedInterests, sortField, sortDir, showSavedOnly]);''', content)

# Navbar replacement (remove bottom border)
navbar_old = 'className="mb-8 flex items-center justify-between border-b border-slate-200/70"'
navbar_new = 'className="mb-8 flex items-center justify-between"'
content = content.replace(navbar_old, navbar_new)

# Reorder discoverContent
# The old one had <div class="w-full lg:w-80 shrink-0"> then <div class="flex-1 min-w-0">
# We want them swapped.
discover_content_match = re.search(r'const discoverContent = \(\n    <div className="flex flex-col lg:flex-row gap-7">(.*?)\n    </div>\n  \);', content, re.DOTALL)

if discover_content_match:
    inner = discover_content_match.group(1)
    sidebar_match = re.search(r'(\s*{\/\* Filter Sidebar \*\/}\s*<div className="w-full lg:w-80 shrink-0">.*?</div>\s*</div>\s*</div>)', inner, re.DOTALL)
    main_match = re.search(r'(\s*{\/\* Main content \*\/}\s*<div className="flex-1 min-w-0">.*</div>)', inner, re.DOTALL)
    
    # We will build a completely new sidebar string to include the new filters
    new_sidebar = '''
          {/* Main content moved to left */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-7">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Search by name, handle, location, or interest…" className="h-14 rounded-full border-slate-200 bg-white pl-14 text-slate-600 shadow-sm" value={search}
                onChange={(e) => setSearch(e.target.value)} data-testid="input-search-creators" />
            </div>

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-base text-slate-500" data-testid="text-creator-count">
                {filtered.length} creator{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:inline">Sort by</span>
                <SortControls field={sortField} dir={sortDir}
                  onFieldChange={setSortField}
                  onDirToggle={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))} />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleCreators.map((creator) => (
                <CreatorCard
                  key={creator.username}
                  creator={creator}
                  isSaved={savedUsernames.has(creator.username)}
                  onToggleSave={(e) => toggleSave(creator, e)}
                  onClick={() => setSelected(creator)}
                  onAddToList={(e) => openListModal(creator.username, e)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No creators match your filters. <button className="text-violet-500 hover:underline ml-1" onClick={clearFilters}>Clear all</button>
              </div>
            )}
          </div>

          {/* Filter Sidebar moved to right */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <div className="h-full overflow-y-auto scroll-smooth pb-8" style={{ scrollbarWidth: "none" }}>
                <div className="pr-1">
                  <Card className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(31,41,55,0.06)]" data-testid="card-filters">

                    {/* ── Social Platforms ── */}
                    <div className="mb-5">
                      <FilterGroup title="Platform" items={platformItems} selected={selectedPlatforms} onChange={setSelectedPlatforms} />
                    </div>

                    {/* ── Categories ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <FilterGroup title="Category" items={categoryItems} selected={selectedCategories} onChange={setSelectedCategories} />
                    </div>

                    {/* ── Followers Range ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Follower count</h3>
                      <Slider
                        min={0}
                        max={10000000}
                        step={50000}
                        value={followerMin}
                        onValueChange={setFollowerMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{followerMin[0] >= 10000000 ? "10M+" : (followerMin[0] >= 1000000 ? (followerMin[0]/1000000).toFixed(1) + "M+" : (followerMin[0]/1000).toFixed(0) + "K+")}</div>
                    </div>

                    {/* ── Engagement Rate ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Engagement rate</h3>
                      <Slider
                        min={0}
                        max={20}
                        step={0.5}
                        value={erMin}
                        onValueChange={setErMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{erMin[0]}%+</div>
                    </div>

                    {/* ── Creator Age ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Creator age</h3>
                      <div className="flex flex-wrap gap-2">
                        {["18-24", "25-34", "35-44", "45+"].map(age => (
                          <button
                            key={age}
                            onClick={() => setSelectedAges(prev => prev.includes(age) ? prev.filter(x => x !== age) : [...prev, age])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedAges.includes(age) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Language ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Language</h3>
                      <div className="flex flex-wrap gap-2">
                        {["English", "Arabic", "Korean", "Spanish", "French", "Hindi"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(x => x !== lang) : [...prev, lang])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedLanguages.includes(lang) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Top Interests ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Top interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Automotive", "Beauty", "Business", "Cooking", "Design", "Esports", "Family", "Fashion", "Finance", "Fitness", "Food", "Gaming", "Health", "Home", "Hospitality", "K-Culture", "Lifestyle", "Parenting", "Photography", "Tech", "Travel", "Wellness"].map(interest => (
                          <button
                            key={interest}
                            onClick={() => setSelectedInterests(prev => prev.includes(interest) ? prev.filter(x => x !== interest) : [...prev, interest])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedInterests.includes(interest) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Gender ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Gender</h3>
                      <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
                        {["All", "Female", "Male", "Non-binary"].map(g => (
                          <button
                            key={g}
                            onClick={() => setGender(g)}
                            className={`flex-1 rounded text-xs font-medium py-1.5 transition-colors ${gender === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Audience Credibility ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Audience credibility</h3>
                      <Slider
                        min={0}
                        max={95}
                        step={5}
                        value={credibilityMin}
                        onValueChange={setCredibilityMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{credibilityMin[0]}%+</div>
                    </div>

                    {/* ── Location ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Location</h3>
                      <div className="relative mb-2">
                        <Input
                          placeholder="Search country…"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className="text-sm h-10 rounded-full border-slate-200 pl-4"
                        />
                      </div>
                      <div className="space-y-3 max-h-56 overflow-y-auto scroll-smooth pt-2" style={{ scrollbarWidth: "thin" }}>
                        {LOCATIONS.filter((l) => l.label.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => (
                          <label key={loc.label} className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={selectedLocations.includes(loc.label)}
                              className="rounded-full border-slate-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                              onCheckedChange={() =>
                                setSelectedLocations((prev) =>
                                  prev.includes(loc.label) ? prev.filter((x) => x !== loc.label) : [...prev, loc.label]
                                )
                              }
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                              {loc.flag} {loc.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-full border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        onClick={clearFilters}
                      >
                        Reset filters
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
    '''
    
    content = content.replace(inner, new_sidebar)

with open("src/app/(platform)/dashboard/discover/page.tsx", "w") as f:
    f.write(content)
