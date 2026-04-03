# Desktop Archive

A simple CLI tool to automatically archive your Desktop files into dated folders.

## What it Does

Archives all files and folders from `~/Desktop` into `~/Desktop/Archive/YYYYMMDD` (e.g., `~/Desktop/Archive/20260402`).

## Installation

```bash
npm link
```

Then run from anywhere:

```bash
archivedt
```

## Behavior

### What Gets Archived
- ✅ All files and folders at the root of `~/Desktop`
- ❌ Excludes the `Archive` folder itself
- ❌ Excludes hidden files (starting with `.`)

### Archive Folder Structure
```
~/Desktop/
  └── Archive/
      └── 20260402/          ← Today's date (YYYYMMDD)
          ├── file.txt      ← Your archived files
          ├── folder1/
          └── image.png
```

### Running Multiple Times Per Day

**Safe to run multiple times on the same day** - the script checks if files with the same name already exist in today's archive folder:

- **If file doesn't exist**: Moves the file from Desktop → Archive
- **If file already exists**: Skips the file and reports it as a naming conflict

**Example scenario:**
1. First run at 9am: Moves `report.pdf` to `Archive/20260402/report.pdf` ✓
2. You download a new file also named `report.pdf` to Desktop
3. Second run at 5pm: 
   - Leaves the original `report.pdf` in the archive folder (won't overwrite)
   - Leaves the new `report.pdf` on Desktop (won't move)
   - Reports `report.pdf` as a naming conflict

The script will display:
```
✖ 1 file(s) skipped due to naming conflicts
┌  Skipped files
│  - report.pdf
└
```

This **prevents accidental data loss** - you decide manually how to handle files with duplicate names.

## Features

- 🚀 **Fast** - Uses native Node.js file operations
- 🎨 **Pretty UI** - Uses clack prompts with animated spinner and color-coded messages
- 🔒 **Safe** - Never overwrites existing files
- 📊 **Progress tracking** - Shows real-time percentage and item count during long runs
- ⚠️ **Conflict reporting** - Clearly lists any files skipped due to naming conflicts