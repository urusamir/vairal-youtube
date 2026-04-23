import re

file_path = "src/app/(platform)/dashboard/lists/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

header_replacement = """      {!hideHeader && (
        <FeaturePageHeader
          title="My Lists"
          description="Organize creators into curated shortlists, then reuse them in campaigns or export them for reporting."
          titleTestId="text-lists-title"
          actions={
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Dummy Data Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Label htmlFor="dummy-toggle-lists" className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                  Preview with data
                </Label>
                <Switch
                  id="dummy-toggle-lists"
                  checked={showDummy}
                  onCheckedChange={setShowDummy}
                  data-testid="switch-dummy-data"
                />
              </div>
              <Button onClick={handleCreateClick} data-testid="button-create-list-header" className="shrink-0" disabled={showDummy}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create List
              </Button>
            </div>
          }
        />
      )}

      {hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Talent Lists</h2>
          <Button onClick={handleCreateClick} data-testid="button-create-list-inline" disabled={showDummy}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create List
          </Button>
        </div>
      )}"""

# We search for the exact block from {!hideHeader && ( ... )} and replace it
match = re.search(r'\{\!hideHeader && \(\s*<FeaturePageHeader[\s\S]*?/>\n\s*\)\}', text)
if match:
    text = text[:match.start()] + header_replacement + text[match.end():]
else:
    print("Could not find hideHeader FeaturePageHeader block")

# Let's add toast to the catch block
# catch (err) { \n console.error(...); \n toast({ ... })
if "toast({ title: \"Error\", description: \"Failed to create list." not in text:
    text = text.replace("} catch (err) {\n      console.error(\"[handleCreate] error:\", err);\n    } finally {",
                        "} catch (err: any) {\n      console.error(\"[handleCreate] error:\", err);\n      toast({ title: \"Error\", description: \"Failed to create list. \" + (err.message || \"\"), variant: \"destructive\" });\n    } finally {")

with open(file_path, "w") as f:
    f.write(text)

