# Deploy & branch workflow

## Get current code onto main and deploy (Vercel)

1. **Commit everything on your branch**
   ```bash
   git add -A
   git commit -m "Focus/study mode, Inbox removal, notes in DB, auth trim, UI fixes"
   ```

2. **Push your feature branch to origin** (creates it on GitHub if needed)
   ```bash
   git push -u origin feature/focus-study-mode
   ```

3. **Merge into main** (choose one):

   **Option A – Merge locally then push main**
   ```bash
   git checkout main
   git pull origin main
   git merge feature/focus-study-mode -m "Merge feature/focus-study-mode into main"
   git push origin main
   ```

   **Option B – Use a Pull Request on GitHub**
   - Push `feature/focus-study-mode` (step 2)
   - On GitHub: open a PR from `feature/focus-study-mode` → `main`
   - Review and merge the PR
   - Vercel will deploy when `main` is updated

4. **Go back to your branch to keep working on summariser**
   ```bash
   git checkout feature/focus-study-mode
   ```
   Continue committing summariser work here. When it’s ready, merge into `main` again (same as step 3).

## Is this a good workflow?

Yes. Summary:

- **main** = what’s live (Vercel deploys from `main`).
- **feature/focus-study-mode** = your working branch (current code + future summariser work).
- Merge **into main** when you want a release; keep building on the branch until then.

Optional later: start a new branch for summariser only, e.g. `feature/summariser`, from the current `feature/focus-study-mode` or from `main` after the first merge.
