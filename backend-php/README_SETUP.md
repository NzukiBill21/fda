# 🚀 Quick Setup - Run This First!

## One-Command Setup

### Windows:
```bash
run-setup.bat
```

### Linux/Mac/Bash:
```bash
chmod +x run-setup.sh && ./run-setup.sh
```

This single command will:
1. ✅ Create `.env` file (you'll need to edit it with your MySQL credentials)
2. ✅ Setup MySQL database and import schema
3. ✅ Migrate all data from SQLite to MySQL
4. ✅ Verify everything works

## After Setup

Run verification:
```bash
php verify-migration.php
```

This will show you:
- ✅ All tables and record counts
- ✅ Data comparison (SQLite vs MySQL)
- ✅ Relationship verification
- ✅ Sample queries to prove everything works

## Manual Steps (If Scripts Don't Work)

1. **Create .env:**
   ```bash
   php create-env.php
   # Then edit .env with your MySQL credentials
   ```

2. **Setup Database:**
   ```bash
   php setup-database.php
   ```

3. **Migrate Data:**
   ```bash
   php migrate-sqlite-to-mysql.php
   ```

4. **Verify:**
   ```bash
   php verify-migration.php
   ```

## ✅ Success Indicators

After running `verify-migration.php`, you should see:
- ✅ All tables created
- ✅ Record counts match (if you had SQLite data)
- ✅ All 6 roles present
- ✅ Relationships working
- ✅ Sample queries successful

## 🎯 You're Done When:

- [ ] `.env` file exists with correct MySQL credentials
- [ ] `verify-migration.php` shows all ✅ green checkmarks
- [ ] All your data is visible in MySQL
- [ ] Sample queries return expected results

Then you're ready to host! 🎉

