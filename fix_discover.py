import re

with open("src/app/(platform)/dashboard/discover/page.tsx", "r") as f:
    content = f.read()

# 1. State changes
content = content.replace('const [followerRange, setFollowerRange] = useState("all");', 'const [followerMin, setFollowerMin] = useState<number[]>([0]);')
content = content.replace('const [engagementRate, setEngagementRate] = useState("any");', 'const [erMin, setErMin] = useState<number[]>([0]);')
content = content.replace('const [credibilityMin, setCredibilityMin] = useState<number[]>([0]);', '') # just in case
content = re.sub(r'const \[gender, setGender\] = useState\("any"\);', 'const [credibilityMin, setCredibilityMin] = useState<number[]>([0]);\n  const [gender, setGender] = useState("All");\n  const [selectedAges, setSelectedAges] = useState<string[]>([]);\n  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);\n  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);', content)

# 2. Filter logic
# find clearFilters
content = re.sub(
    r'const clearFilters = \(\) => \{.*?\};',
    '''const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPlatforms([]);
    setFollowerMin([0]);
    setErMin([0]);
    setCredibilityMin([0]);
    setSelectedLocations([]);
    setLocationSearch("");
    setGender("All");
    setSelectedAges([]);
    setSelectedLanguages([]);
    setSelectedInterests([]);
    setShowSavedOnly(false);
    setSearch("");
  };''',
    content,
    flags=re.DOTALL
)

# Replace hasActiveFilters
content = re.sub(
    r'const hasActiveFilters =.*?;',
    '''const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPlatforms.length > 0 ||
    followerMin[0] > 0 ||
    erMin[0] > 0 ||
    credibilityMin[0] > 0 ||
    selectedLocations.length > 0 ||
    gender !== "All" ||
    selectedAges.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedInterests.length > 0 ||
    showSavedOnly ||
    !!search.trim();''',
    content,
    flags=re.DOTALL
)

with open("src/app/(platform)/dashboard/discover/page.tsx", "w") as f:
    f.write(content)
