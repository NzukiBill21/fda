# 📍 Where to Find Hostinger Details - Step by Step

## 🎯 As a Collaborator - What You Need

Since you're a collaborator, you might need to **ask the manager/owner** for some details. Here's exactly what to ask for and where they can find it.

---

## 📋 What You Need to Ask the Manager For

### Option 1: Ask Manager to Share These Details

**Send this message to the manager:**

```
Hi! I need these Hostinger details to deploy the app to mymondas.com:

1. FTP/SFTP Access:
   - FTP Host: 
   - FTP Username: 
   - FTP Password: 

2. Database Details:
   - Database Type: (MySQL or PostgreSQL)
   - Database Host: 
   - Database Name: 
   - Database Username: 
   - Database Password: 

3. Hosting Plan Type:
   - [ ] Shared Hosting (cPanel)
   - [ ] VPS Hosting
   - [ ] Cloud Hosting

4. SSH Access: (Yes/No - and credentials if available)
```

---

## 🔍 Where Manager Can Find These Details

### **Step 1: Log into Hostinger**

1. Go to **hpanel.hostinger.com** (or the Hostinger login page)
2. Log in with the main account credentials

---

### **Step 2: Find FTP/SFTP Details**

**Location:** `hPanel` → `Files` → `FTP Accounts`

**Steps:**
1. Click **"Files"** in the left menu
2. Click **"FTP Accounts"**
3. You'll see:
   - **FTP Host:** Usually `ftp.yourdomain.com` or an IP address
   - **FTP Username:** Your FTP username
   - **FTP Password:** (Click "Show" to reveal)

**OR if using File Manager:**
- Go to **"Files"** → **"File Manager"**
- The path shows your server structure

---

### **Step 3: Find Database Details**

**Location:** `hPanel` → `Databases` → `MySQL Databases` (or PostgreSQL)

**Steps:**
1. Click **"Databases"** in the left menu
2. Click **"MySQL Databases"** (or **"PostgreSQL"** if using that)
3. You'll see existing databases OR need to create one:
   - **Database Name:** (e.g., `u123456789_mymondas`)
   - **Database Username:** (e.g., `u123456789_admin`)
   - **Database Password:** (Click "Show" to reveal)
   - **Database Host:** Usually `localhost` or `mysql.hostinger.com`

**To Create New Database:**
1. Scroll down to **"Create New Database"**
2. Enter database name
3. Create username and password
4. Click **"Create"**
5. Note all the details!

---

### **Step 4: Find Hosting Plan Type**

**Location:** `hPanel` → `Account` → `Subscription`

**Steps:**
1. Click **"Account"** in the left menu
2. Click **"Subscription"** or **"Plan Details"**
3. You'll see:
   - **Plan Type:** Shared Hosting / VPS / Cloud Hosting
   - **Server Details:** (if VPS/Cloud)

---

### **Step 5: Check SSH Access**

**Location:** `hPanel` → `Advanced` → `SSH Access`

**Steps:**
1. Click **"Advanced"** in the left menu
2. Click **"SSH Access"**
3. You'll see:
   - **SSH Status:** Enabled/Disabled
   - **SSH Host:** (if enabled)
   - **SSH Username:** (usually same as FTP)
   - **SSH Port:** (usually 22)

**Note:** SSH might not be available on Shared Hosting plans.

---

## 🎯 Alternative: Manager Can Give You Access

### **Option 1: Add You as Collaborator with Full Access**

**Manager should:**
1. Go to `hPanel` → `Account` → `Collaborators`
2. Click **"Add Collaborator"**
3. Enter your email
4. Give **"Full Access"** or at least:
   - ✅ Files access
   - ✅ Database access
   - ✅ Advanced settings

### **Option 2: Manager Creates Database & Shares Credentials**

**Manager can:**
1. Create the database (see Step 3 above)
2. Create FTP account for you (see Step 2 above)
3. Share the credentials securely

---

## 📸 Screenshots to Ask Manager For

**Ask manager to take screenshots of:**

1. **FTP Accounts page** (showing FTP host, username)
2. **MySQL Databases page** (showing database name, username, host)
3. **Subscription page** (showing plan type)
4. **SSH Access page** (if available)

---

## 🔐 Security Note

**Important:** 
- Manager can share credentials here (I'll help set up)
- After deployment, change passwords for security
- Never commit credentials to Git

---

## ✅ Quick Checklist for Manager

**Manager should provide:**

- [ ] FTP Host address
- [ ] FTP Username
- [ ] FTP Password
- [ ] Database Type (MySQL/PostgreSQL)
- [ ] Database Host
- [ ] Database Name
- [ ] Database Username
- [ ] Database Password
- [ ] Hosting Plan Type
- [ ] SSH Access (Yes/No)

---

## 🚀 Once You Have These Details

**Share them with me in this format:**

```
=== FTP ACCESS ===
FTP Host: ftp.mymondas.com
FTP Username: u123456789
FTP Password: [password]

=== DATABASE ===
Database Type: MySQL
Database Host: localhost
Database Name: u123456789_mymondas
Database Username: u123456789_admin
Database Password: [password]

=== HOSTING ===
Plan Type: Shared Hosting (cPanel)
SSH Access: No
```

**Then I'll:**
1. ✅ Create all configuration files
2. ✅ Set up environment variables
3. ✅ Prepare deployment scripts
4. ✅ Guide you through deployment

---

## 💡 If Manager Doesn't Have Access Either

**If the domain was just purchased:**
- Database might need to be created first
- FTP account might need to be set up
- Manager should contact Hostinger support if needed

**Hostinger Support:**
- Live chat in hPanel
- Email support
- They can help set up database and FTP

---

## 📞 Next Steps

1. **Share this guide with the manager**
2. **Ask manager to provide the details** (or give you collaborator access)
3. **Once you have details, share them with me**
4. **I'll prepare everything for deployment!**

**Ready? Get the details from the manager and let's deploy! 🚀**

