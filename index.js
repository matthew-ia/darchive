#!/usr/bin/env node

import { readdir, mkdir, rename, access } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { constants } from 'fs';
import * as clack from '@clack/prompts';
import pc from 'picocolors';

const DESKTOP_PATH = join(homedir(), 'Desktop');

// Get current date in YYYYMMDD format
function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function archiveDesktop() {
  try {
    const dateString = getDateString();
    const archivePath = join(DESKTOP_PATH, 'Archive', dateString);
    
    // Ensure archive folder exists
    await mkdir(archivePath, { recursive: true });
    
    // Get all items on desktop
    const allItems = await readdir(DESKTOP_PATH);
    
    // Filter out Archive folder and hidden files
    const itemsToMove = allItems.filter(item => {
      return item !== 'Archive' && !item.startsWith('.');
    });

    const introMsg = pc.bold(pc.white('Desktop Archive'));
    
    const itemCount = itemsToMove.length;
    
    if (itemCount === 0) {
      clack.intro(introMsg);
      clack.log.info(pc.dim('No items to archive'));
      clack.outro(pc.green(`Desktop is all clean! 🧼`));
      return { itemCount: 0, dateString, archivePath: `Archive/${dateString}` };
    }
    
    // Start with intro
    clack.intro(introMsg);
    
    // Create spinner
    const s = clack.spinner();
    s.start(`Archiving ${itemCount} item(s) to Archive/${dateString}`);
    
    // Track moved and conflicted items
    let movedCount = 0;
    const conflicts = [];
    
    // Move each item with spinner progress
    for (let i = 0; i < itemCount; i++) {
      const item = itemsToMove[i];
      const sourcePath = join(DESKTOP_PATH, item);
      const targetPath = join(archivePath, item);
      
      const percent = Math.round(((i + 1) / itemCount) * 100);
      s.message(`${percent}% complete (${i + 1}/${itemCount})`);
      
      // Check if target file already exists
      try {
        await access(targetPath, constants.F_OK);
        // File exists - skip and record conflict
        conflicts.push(item);
      } catch {
        // File doesn't exist - move it
        await rename(sourcePath, targetPath);
        movedCount++;
      }
    }
    
    s.stop(`Archived ${movedCount} item(s)`);
    
    // Log conflicts if any
    if (conflicts.length > 0) {
      clack.log.error(pc.gray(`${conflicts.length} file(s) skipped due to naming conflicts`));
      let conflictList = '';
      conflicts.forEach((file, i) => {
        conflictList += i === 0 ? '' : '\n';
        conflictList += ` - ${file}`;
      });
      clack.note(conflictList, pc.gray(`Skipped files`));
    }
    
    // Final completion message
    if (movedCount > 0) {
      clack.outro(pc.green(`Done ✓ ${pc.dim(`~/Desktop/Archive/${dateString}`)}`));
    } else if (conflicts.length > 0) {
      clack.outro(pc.gray('No new items moved (all had conflicts)'));
    }
    
    return { itemCount: movedCount, dateString, archivePath: `Archive/${dateString}`, conflicts };
    
  } catch (error) {
    clack.cancel(pc.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Run the archival
archiveDesktop();
