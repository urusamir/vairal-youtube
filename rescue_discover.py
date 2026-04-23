import re

file_path = "src/app/(platform)/dashboard/discover/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Make sure imports are there
if "import { Tabs" not in text:
    text = text.replace('import { FeaturePageHeader } from "@/components/layout/feature-page-header";',
'''import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListsPanel } from "@/app/(platform)/dashboard/lists/page";''')

if "const [activeTab" not in text:
    text = text.replace('const [search, setSearch] = useState("");',
                        'const [activeTab, setActiveTab] = useState("creators");\n  const [search, setSearch] = useState("");')
    
    text = text.replace('const [showSavedOnly, setShowSavedOnly] = useState(false);',
                        'const [showSavedOnly, setShowSavedOnly] = useState(false);\n\n  useEffect(() => {\n    setShowSavedOnly(activeTab === "saved");\n  }, [activeTab]);\n')


# Now, I need to reliably find the start and end of the return statement.
# `  return (` is unique for the main component.
return_start = text.find("  return (\n    <>\n")

# Find the end: `    </>\n  );\n}`
return_end = text.rfind("    </>\n  );\n}") + len("    </>\n  );\n}")

if return_start != -1 and return_end != -1:
    return_block = text[return_start:return_end]
    
    # We want to keep `{selected && <CreatorProfileModal ... />}` intact
    # We want to keep `FeaturePageHeader` intact
    
    # Let's split on `<div className="flex gap-6">`
    flex_split = return_block.split('<div className="flex gap-6">')
    
    pre_flex = flex_split[0]
    
    # The end of the flex container is `        </div>\n      </div>\n`
    # Let's split by that string on the second part
    post_flex_split = flex_split[1].split('        </div>\n      </div>\n')
    
    core_ui = post_flex_split[0]
    post_ui = "        </div>\n      </div>\n" + post_flex_split[1]

    # Pre-flex contains `      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">` and `<FeaturePageHeader ... />`
    
    tabs_wrapped = f"""
  const discoverContent = (
    <div className="flex gap-6">
{core_ui}
    </div>
  );

{pre_flex}
        <Tabs value={{activeTab}} onValueChange={{setActiveTab}} className="w-full mt-6">
          <TabsList className="mb-6 bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 space-x-6">
            <TabsTrigger value="creators" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Creators</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Saved Creators</TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">Talent Lists</TabsTrigger>
          </TabsList>
          
          <TabsContent value="creators" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {{discoverContent}}
          </TabsContent>
          <TabsContent value="saved" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {{discoverContent}}
          </TabsContent>
          <TabsContent value="lists" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="-mx-6 sm:-mx-8">
              <ListsPanel hideHeader={{true}} />
            </div>
          </TabsContent>
        </Tabs>
{post_ui}"""

    text = text[:return_start] + tabs_wrapped + text[return_end:]

with open(file_path, "w") as f:
    f.write(text)

