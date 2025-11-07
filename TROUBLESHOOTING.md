# 🔧 Troubleshooting White Page Issue

## Quick Checks

### 1. Test if Apache is Working
Visit: `http://localhost/fda/build/test.html`
- If you see "Test Page - XAMPP is Working!" → Apache is fine
- If you get 404 → Check Apache is running and file exists

### 2. Check Browser Console (F12)
Open Developer Tools (F12) and check:
- **Console tab**: Look for JavaScript errors (red text)
- **Network tab**: Check if assets are loading (status 200 = OK, 404 = missing)

### 3. Verify Root Element
In browser console, type:
```javascript
document.getElementById('root')
```
- Should return: `<div id="root"></div>`
- If `null` → HTML file issue

### 4. Check Asset Loading
In Network tab, verify these load successfully:
- `/fda/build/assets/index-*.js` (should be 200 OK)
- `/fda/build/assets/index-*.css` (should be 200 OK)
- `/fda/build/manifest.json` (should be 200 OK)

## Common Issues

### Issue 1: JavaScript Errors
**Symptom**: White page, errors in console
**Solution**: 
- Check console for specific error
- Verify all asset paths are correct
- Check if React is loading

### Issue 2: CSP (Content Security Policy) Blocking
**Symptom**: Scripts blocked in console
**Solution**: 
- Check CSP in `build/index.html`
- Verify `unsafe-eval` is allowed for scripts
- Check `connect-src` includes `/fda/backend-php`

### Issue 3: React Router Not Working
**Symptom**: Page loads but shows blank
**Solution**:
- Verify `.htaccess` exists in `build/` folder
- Check `RewriteEngine On` is enabled in Apache
- Verify `mod_rewrite` is enabled in Apache

### Issue 4: Base Path Issues
**Symptom**: Assets 404 errors
**Solution**:
- Verify `vite.config.ts` has `base: '/fda/build/'`
- Rebuild: `npm run build`
- Check asset paths in `build/index.html`

## Step-by-Step Debug

1. **Check Apache Error Log**
   - Location: `C:\xampp\apache\logs\error.log`
   - Look for PHP or rewrite errors

2. **Check File Permissions**
   - Ensure files are readable
   - Check `.htaccess` is not blocked

3. **Test Direct Access**
   - `http://localhost/fda/build/index.html` → Should show HTML
   - `http://localhost/fda/build/assets/index-*.js` → Should download JS file

4. **Verify mod_rewrite**
   - Check `httpd.conf` for `LoadModule rewrite_module`
   - Restart Apache after changes

5. **Clear Browser Cache**
   - Hard refresh: `Ctrl+F5` or `Cmd+Shift+R`
   - Or clear cache completely

## Quick Fixes

### Fix 1: Rebuild Frontend
```bash
cd c:\xampp\htdocs\fda
npm run build
```

### Fix 2: Check .htaccess
Verify `build/.htaccess` exists and has correct RewriteBase

### Fix 3: Enable mod_rewrite
1. Open `C:\xampp\apache\conf\httpd.conf`
2. Find: `#LoadModule rewrite_module`
3. Change to: `LoadModule rewrite_module modules/mod_rewrite.so`
4. Restart Apache

### Fix 4: Check Apache Configuration
In `httpd.conf`, find:
```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```
Ensure `AllowOverride All` is set.

## Still Not Working?

1. Check browser console for specific errors
2. Verify all files exist in `build/` folder
3. Test with a simple HTML file first
4. Check Apache error logs
5. Verify PHP backend is accessible: `http://localhost/fda/backend-php/health`

---

**Need more help?** Share the browser console errors and we can fix them!

