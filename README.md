# 🌍 Atlas — My Travel Map

A personal travel tracker that lets you mark countries as **Visited** or **Want to Visit** on an interactive world map.

## Features

- Interactive flat world map with country borders
- Tap any country to mark it as Visited or Want to Visit
- Search bar to find and tag countries quickly
- Colour-coded map (green = visited, orange = want to visit)
- Stats bar showing your counts
- Data saved locally in your browser (localStorage)

## Live App

Once deployed, your app will be at:
`https://<your-github-username>.github.io/<your-repo-name>/`

---

## How to Deploy (step by step)

### 1. Create a GitHub account
If you don't have one, sign up at [github.com](https://github.com).

### 2. Create a new repository
- Go to [github.com/new](https://github.com/new)
- Name it something like `travel-map`
- Set it to **Public**
- Don't initialise with a README (we already have one)
- Click **Create repository**

### 3. Upload the files
Option A — via the GitHub website:
- On your new repo page, click **uploading an existing file**
- Drag and drop all the project files (including the `.github` folder)
- Click **Commit changes**

Option B — via Git (if you have it installed):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 4. Enable GitHub Pages
- Go to your repo → **Settings** → **Pages** (left sidebar)
- Under **Source**, select **GitHub Actions**
- Save

### 5. Wait ~60 seconds
GitHub will automatically build and deploy your app. You'll see a green tick on the **Actions** tab when it's done.

### 6. Visit your app
Go to `https://<your-github-username>.github.io/<your-repo-name>/`

---

## Updating the app

Any time you push new code to the `main` branch, GitHub Actions will automatically redeploy the app within about a minute.

---

## Future ideas
- Backend sync so data persists across devices
- Share your map with friends
- Trip notes per country
- Visit dates
