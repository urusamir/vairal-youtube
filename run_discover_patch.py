import re

file_path = "src/app/(platform)/dashboard/discover/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# 1. Imports
if "import { Tabs" not in text:
    text = text.replace('import { FeaturePageHeader } from "@/components/layout/feature-page-header";',
'''import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListsPanel } from "@/app/(platform)/dashboard/lists/page";''')

# 2. State
if "const [activeTab" not in text:
    text = text.replace('const [search, setSearch] = useState("");',
                        'const [activeTab, setActiveTab] = useState("creators");\n  const [search, setSearch] = useState("");')

    text = text.replace('const [showSavedOnly, setShowSavedOnly] = useState(false);',
                        'const [showSavedOnly, setShowSavedOnly] = useState(false);\n\n  useEffect(() => {\n    setShowSavedOnly(activeTab === "saved");\n  }, [activeTab]);\n')

# 3. Layout Restructuring
original_return_start = """    <>
      {selected && <CreatorProfileModal creator={selected} onClose={() => setSelected(null)} />}

      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
        <FeaturePageHeader
          title="Creator Discovery"
          description="Find the right creators for your brand by filtering platform, location, audience profile, engagement, and category."
          titleTestId="text-discover-title"
        />

        <div className="flex gap-6">"""

new_return_start = """    <>
      {selected && <CreatorProfileModal creator={selected} onClose={() => setSelected(null)} />}

      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
        <FeaturePageHeader
          title="Creator Discovery"
          description="Find the right creators for your brand by filtering platform, location, audience profile, engagement, and category."
          titleTestId="text-discover-title"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 space-x-6">
            <TabsTrigger value="creators" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Creators</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Saved Creators</TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Talent Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="creators" className="mt-0">
            <div className="flex gap-6">"""

# Close tags logic
original_return_end = """        </div>
      </div>
    </>
  );"""

new_return_end = """        </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {/* Same layout is preserved through state forcing showSavedOnly */}
            <div className="flex gap-6">
""" # wait, I need to render the same exact structure for `saved`. This is problematic with regex.

