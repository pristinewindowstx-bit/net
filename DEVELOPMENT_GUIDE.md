# Development Environment Guide

## Question: GitHub-based Tools vs Local Development - Which Should I Use?

This guide helps you choose the right development environment for working on the Pristine Windows and Services website. It compares GitHub-based tools (GitHub Copilot, GitHub.dev, GitHub Codespaces) with local development environments (Visual Studio Code, Visual Studio).

---

## Quick Answer

**For this project, both approaches are excellent, but they serve different purposes:**

- **Use GitHub-based tools (GitHub.dev/Codespaces with Copilot)** for quick edits, collaborative reviews, and when you want to work from anywhere
- **Use local development (VS Code/Visual Studio)** for extensive development, full IDE features, and testing live previews

---

## Detailed Comparison

### GitHub-based Development Tools

This section covers three related but distinct tools:
- **GitHub Copilot** - AI-powered code completion assistant (works in both web and local editors)
- **GitHub.dev** - Lightweight web-based code editor (press `.` on any repo)
- **GitHub Codespaces** - Full cloud development environment with VS Code in browser

**Best for:**
- ✅ Quick fixes and small edits to HTML/CSS
- ✅ Reviewing and making changes during pull requests
- ✅ Working from different devices (tablet, Chromebook, etc.)
- ✅ Collaboration with others in real-time
- ✅ No local setup required - works in browser
- ✅ AI-powered code suggestions and completions
- ✅ Direct integration with GitHub issues and pull requests

**Limitations:**
- ⚠️ Requires internet connection
- ⚠️ Limited live preview capabilities (though Codespaces has preview)
- ⚠️ May be slower for large-scale refactoring

**How to use:**
1. Press `.` (period) on any GitHub repository page to open GitHub.dev
2. Use GitHub Codespaces for a full cloud development environment
3. Enable GitHub Copilot for AI-assisted coding

---

### Visual Studio / Visual Studio Code (Local)

**Best for:**
- ✅ Full-featured IDE with extensive extensions
- ✅ Live Server extension for real-time HTML preview
- ✅ Offline development when internet is unavailable
- ✅ Working with large files or complex projects
- ✅ Advanced debugging and testing tools
- ✅ Full control over development environment
- ✅ Faster performance for intensive operations

**Limitations:**
- ⚠️ Requires local installation and setup
- ⚠️ Takes up disk space
- ⚠️ Need to manually sync with GitHub (push/pull)

**How to use:**
1. Download and install [Visual Studio Code](https://code.visualstudio.com/)
2. Install recommended extensions:
   - Live Server (for HTML preview)
   - HTML CSS Support
   - Prettier (code formatting)
   - GitHub Copilot (if you have access)
3. Clone the repository: `git clone https://github.com/pristinewindowstx-bit/net.git`
4. Open the project folder in VS Code

---

## Recommendations for This Project

Since this is a **static HTML/CSS website**, here's what I recommend:

### For Daily Edits and Content Updates
**→ Use GitHub Copilot / GitHub.dev**
- Perfect for updating text, prices, contact info
- Quick edits to services, FAQ, or gallery pages
- No need to set up a local environment

### For Design Changes and Layout Work
**→ Use Visual Studio Code (Local) with Live Server**
- Install the Live Server extension
- Right-click on `index.html` → "Open with Live Server"
- See changes instantly in your browser
- Much better for CSS tweaks and responsive design testing

### For Testing Before Publishing
**→ Use Visual Studio Code (Local)**
- Open all HTML files in browser to test navigation
- Check that all links work correctly
- Test on different screen sizes using browser dev tools
- Verify forms work as expected

---

## My Workflow Recommendation

Here's a suggested hybrid workflow:

1. **Small text/content changes**: Use GitHub.dev (press `.` on any page)
2. **CSS/styling changes**: Use VS Code locally with Live Server
3. **Reviewing others' changes**: Use GitHub's web interface
4. **Adding new pages**: Use VS Code locally to test thoroughly

---

## Setup Guide for Visual Studio Code

If you choose to use VS Code locally, here's a quick setup:

```bash
# 1. Clone the repository
git clone https://github.com/pristinewindowstx-bit/net.git
cd net

# 2. Open in VS Code
code .
```

**Recommended VS Code Extensions:**
- `ritwickdey.LiveServer` - Live Server for instant HTML preview
- `GitHub.copilot` - AI code completion (requires subscription)
- `esbenp.prettier-vscode` - Code formatter
- `formulahendry.auto-rename-tag` - Auto-rename paired HTML tags

**To preview your site:**
1. Install Live Server extension
2. Right-click on any `.html` file
3. Select "Open with Live Server"
4. Site opens at `http://localhost:5500`

---

## Current Project Structure

```
net/
├── index.html          # Homepage
├── services.html       # Services page
├── gallery.html        # Gallery page
├── about.html          # About page
├── reviews.html        # Reviews page
├── faq.html           # FAQ page
├── thanks.html        # Thank you page
├── assets/            # Images and CSS
│   ├── styles.css
│   ├── logo.jpg
│   └── gallery/
└── site/              # Duplicate structure (consider consolidating)
    ├── index.html
    ├── services.html
    └── ...
```

**Note:** There appears to be duplicate HTML files in both the root and `site/` directory. Consider consolidating to avoid confusion.

---

## Conclusion

**For this static website project, I recommend:**

- Start with **GitHub Copilot/GitHub.dev** for simple changes
- Graduate to **VS Code (local)** when you need live preview
- Use **both** depending on the task at hand

There's no wrong choice - use what feels most comfortable and efficient for your workflow!

---

## Need Help?

- **GitHub Copilot Documentation**: https://docs.github.com/en/copilot
- **VS Code Documentation**: https://code.visualstudio.com/docs
- **HTML/CSS Resources**: https://developer.mozilla.org/en-US/docs/Web

---

*Document created: October 2024*
