# Testing dnd-kit Drag and Drop

## Quick Start

The dev server is running at **http://localhost:3001**

## Test Scenarios

### 1. Drag from Carousel (Home Page)

**Location:** Home page → "Recently Liked" carousel

**Desktop Testing:**
1. Open http://localhost:3001
2. Scroll to the "Recently Liked" carousel
3. Click and drag a video card (you'll need to move ~8px before drag starts)
4. Drag over a folder in the sidebar → Should highlight
5. Drag over a folder tile on the page → Should highlight
6. Release to drop → Toast notification should appear
7. Video should move to the selected folder

**Expected Behavior:**
- Original card stays in place with 50% opacity
- Drag overlay follows cursor (rotated 3° for depth)
- Drop zones highlight with ring and background color
- Toast confirms move: "Video moved to [Folder Name]"

### 2. Drag from Liked Videos Page

**Location:** Liked Videos page (navigate from sidebar)

**Grid View:**
1. Click "Liked Videos" in sidebar
2. Ensure view mode is "Grid" (toggle in top right)
3. Drag any video card to a folder
4. Verify move is successful

**List View:**
1. Toggle to "List" view
2. Drag any video row to a folder
3. Note: List items have a wider drag handle area
4. Verify move is successful

### 3. Drag from Folder Page

**Location:** Any folder page

**Testing:**
1. Click any folder in sidebar to open it
2. Drag videos from this folder to other folders
3. Test both grid and list views
4. Videos should move between folders

### 4. Multiple Drop Zones

**Test all drop zone types:**
- **Sidebar folders** - Small compact items
- **Home page folder tiles** - Large 3-column grid
- **Home page folder list** - Rows below tiles
- All should work consistently

### 5. Carousel Scroll vs Drag

**Important Test for Touch Conflicts:**

**Desktop:**
1. Try to scroll the carousel by clicking and dragging quickly
2. Should scroll without starting a drag
3. Now click and drag slowly (hold for a moment)
4. Should start dragging the video

**Touch Devices (if available):**
1. Swipe quickly to scroll carousel
2. Should scroll normally
3. Press and hold a video card for 250ms
4. Should start dragging (you'll feel it)
5. Drag to folder and release

### 6. Visual Feedback

**Check these visual states:**
- **Idle state**: Cards show cursor-grab
- **Dragging**: Original card at 50% opacity, cursor-grabbing
- **Drag overlay**: Semi-transparent card following cursor
- **Drop zone hover**: Ring highlight + background color change
- **After drop**: Overlay disappears, card opacity returns

### 7. Error Handling

**Test error scenarios:**
1. Disconnect internet (or use dev tools to block network)
2. Try to move a video
3. Should show error toast: "Failed to move video"
4. Reconnect and retry - should work

### 8. Edge Cases

**Test these scenarios:**
1. **Drag to same folder** - Should still work (no-op)
2. **Drag to "Add folder" button** - Should not drop (disabled)
3. **Cancel drag** - Press Escape or drag outside → Overlay disappears
4. **Rapid drags** - Drag multiple videos quickly → All should work

## Keyboard Testing (Accessibility)

**Keyboard navigation:**
1. Press Tab to focus on a video card
2. Press Space or Enter to start drag
3. Press Tab to navigate to folders
4. Press Space or Enter to drop
5. Press Escape to cancel

**Expected:**
- Focus ring visible on all interactive elements
- Screen reader announces drag state
- All functionality accessible without mouse

## Performance Testing

**Check for:**
- Smooth 60fps drag animations
- No lag or jitter during drag
- Fast drop processing (<100ms)
- No memory leaks (drag many times)
- Responsive on low-end devices

## Mobile Testing Checklist

**If you have a mobile device:**

**iOS Safari:**
- [ ] Open http://localhost:3001 (use IP address for remote device)
- [ ] Test carousel scrolling (swipe)
- [ ] Test press-and-hold to drag (250ms delay)
- [ ] Test dropping on sidebar folders
- [ ] Test dropping on folder tiles
- [ ] Check visual feedback on touch
- [ ] Verify no scroll conflicts

**Android Chrome:**
- [ ] Same tests as iOS
- [ ] Check if activation constraints feel natural
- [ ] Test in landscape and portrait modes

## Common Issues & Solutions

### Issue: Drag starts too easily (conflicts with scrolling)
**Solution:** Increase activation constraints in `components/dnd-provider.tsx`:
```typescript
distance: 12,  // or higher
delay: 350,    // or higher
tolerance: 8,  // or higher
```

### Issue: Drag starts too slowly (feels unresponsive)
**Solution:** Decrease activation constraints:
```typescript
distance: 5,   // or lower
delay: 150,    // or lower
tolerance: 3,  // or lower
```

### Issue: Drag overlay looks wrong
**Solution:** Adjust overlay styles in `components/dnd-provider.tsx`:
```typescript
<div className="opacity-80 rotate-3 cursor-grabbing">
  {/* Adjust classes */}
</div>
```

### Issue: Drop zones not highlighting
**Check:**
1. Open browser console for errors
2. Verify folders are loading (check network tab)
3. Check if `useDroppable` hook is properly connected
4. Verify folder IDs are unique

### Issue: Videos not moving
**Check:**
1. Network tab for API errors
2. Console for JavaScript errors
3. Verify authentication (should be logged in)
4. Check if `useMoveVideo` mutation is firing

## Browser Console Debugging

**Open DevTools Console and check for:**
- No red errors during drag/drop
- React Query cache invalidations after drop
- API calls to `/api/videos/move` with correct payload

**Useful debug additions:**
Add to `components/dnd-provider.tsx` for debugging:
```typescript
const handleDragStart = (event: DragStartEvent) => {
  console.log('Drag started:', event.active.data.current)
  // ... existing code
}

const handleDragEnd = async (event: DragEndEvent) => {
  console.log('Drag ended:', {
    active: event.active.data.current,
    over: event.over?.data.current
  })
  // ... existing code
}
```

## Success Criteria

✅ **Must Work:**
- Drag from carousel to all folder types
- Drag from liked videos page to all folder types
- Drag from folder pages to other folders
- Visual feedback on all interactions
- Toast notifications on success/error
- No conflicts with carousel scrolling

✅ **Should Work:**
- Touch devices (press-and-hold)
- Keyboard navigation
- Error handling
- Fast drag animations

✅ **Nice to Have:**
- Mobile testing completed
- Accessibility verified
- Performance metrics good

## Next Steps After Testing

1. **If everything works:** 🎉 Implementation complete!
2. **If issues found:** Adjust activation constraints or report bugs
3. **Mobile testing:** Test on real devices if possible
4. **User feedback:** Get input from real users
5. **Documentation:** Update user guide with drag-and-drop instructions

## Reporting Issues

If you find any issues, note:
- Browser and version
- Device (desktop/mobile/tablet)
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Network errors (if any)

---

**Happy Testing! 🚀**
