# 📍 Navigate to This Directory First!

## Current Location Issue

You're in your home directory (`~`). You need to navigate to the project directory first.

## ✅ Correct Commands

### Step 1: Navigate to Project Directory

```bash
cd "C:/Users/billn/Downloads/Food Delivery App"
```

**OR** if that doesn't work:

```bash
cd /c/Users/billn/Downloads/Food\ Delivery\ App
```

### Step 2: Navigate to Backend-PHP

```bash
cd backend-php
```

### Step 3: Run Setup

```bash
chmod +x run-complete-setup.sh
./run-complete-setup.sh
```

## 🔍 Check Your Current Location

```bash
pwd
```

You should see:
```
/c/Users/billn/Downloads/Food Delivery App/backend-php
```

## 📝 Full Path (Copy & Paste)

```bash
cd "C:/Users/billn/Downloads/Food Delivery App/backend-php"
chmod +x run-complete-setup.sh
./run-complete-setup.sh
```

## ⚠️ If Still Not Found

List what's in your current directory:
```bash
ls
```

Then navigate step by step:
```bash
cd Downloads
cd "Food Delivery App"
cd backend-php
```

