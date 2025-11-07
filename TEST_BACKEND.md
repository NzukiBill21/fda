# Test Backend Connection

## Quick Test

1. **Test Backend Health:**
   ```
   http://localhost/fda/backend-php/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test Menu API:**
   ```
   http://localhost/fda/backend-php/api/menu
   ```
   Should return: `{"success":true,"menuItems":[...]}`

3. **If Backend Not Working:**
   - Check Apache is running
   - Check PHP is enabled
   - Check `backend-php/.env` exists
   - Run: `cd backend-php && php setup-database.php`

