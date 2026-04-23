import re

file_path = "src/app/(platform)/dashboard/discover/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Make sure we don't double inject Tabs logic
if 'const discoverContent =' not in text:
    blob_start = """      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
        <FeaturePageHeader
          title="Creator Discovery"
          description="Find the right creators for your brand by filtering platform, location, audience profile, engagement, and category."
          titleTestId="text-discover-title"
        />

        <div className="flex gap-6">"""
    
    blob_end = """        </div>
      </div>
    </>
  );"""

    if blob_start in text and blob_end in text:
        parts = text.split(blob_start)
        pre_return = parts[0]
        # pre_return actually has the start of the return: 
        #   return (
        #     <>
        #       {selected && <CreatorProfileModal creator={selected} onClose={() => setSelected(null)} />}
        
        post_start = parts[1]
        
        # Now find blob_end inside post_start
        inner_parts = post_start.split(blob_end)
        discover_ui_core = inner_parts[0]
        
        discover_content_variable = f"""
  const discoverContent = (
    <div className="flex gap-6">
{discover_ui_core}
    </div>
  );
"""
        
        # find where to inject `discoverContent`
        # right before `return (`
        # text has a string `  return (`
        
        text = text.replace("  return (\n    <>", discover_content_variable + "  return (\n    <>")
        
        new_render_blob = """      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
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
          
          <TabsContent value="creators" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {discoverContent}
          </TabsContent>
          <TabsContent value="saved" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {discoverContent}
          </TabsContent>
          <TabsContent value="lists" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="-mx-6 sm:-mx-8">
              <ListsPanel hideHeader={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );"""

        text = text.replace(blob_start + discover_ui_core + blob_end, new_render_blob)

with open(file_path, "w") as f:
    f.write(text)

