import sqlite3
import shutil
import os

DB_PATH = "sih.db"
BACKUP_PATH = "sih_backup_before_national_code_fix.db"

print("Creating database backup...")

if not os.path.exists(DB_PATH):
    print("ERROR: sih.db not found.")
    raise SystemExit(1)

shutil.copy2(DB_PATH, BACKUP_PATH)

print(f"Backup created: {BACKUP_PATH}")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("Checking existing standardized_materials table...")

# Rename old table
cursor.execute("""
    ALTER TABLE standardized_materials
    RENAME TO standardized_materials_old
""")

# Create the corrected table
cursor.execute("""
    CREATE TABLE standardized_materials (
        id INTEGER NOT NULL,
        owner_id INTEGER NOT NULL,
        national_code VARCHAR NOT NULL,
        standard_description TEXT,
        category VARCHAR,
        status VARCHAR,
        PRIMARY KEY (id)
    )
""")

# Recreate the index on id
cursor.execute("""
    CREATE INDEX ix_standardized_materials_id
    ON standardized_materials (id)
""")

# Copy all existing data
cursor.execute("""
    INSERT INTO standardized_materials
    (
        id,
        owner_id,
        national_code,
        standard_description,
        category,
        status
    )
    SELECT
        id,
        owner_id,
        national_code,
        standard_description,
        category,
        status
    FROM standardized_materials_old
""")

# Remove old table
cursor.execute("""
    DROP TABLE standardized_materials_old
""")

conn.commit()

# Verify the new schema
print("\nNew table structure:")

cursor.execute("""
    PRAGMA table_info(standardized_materials)
""")

for row in cursor.fetchall():
    print(row)

print("\nChecking indexes:")

cursor.execute("""
    PRAGMA index_list(standardized_materials)
""")

for row in cursor.fetchall():
    print(row)

conn.close()

print("\n========================================")
print("DATABASE FIX COMPLETED SUCCESSFULLY")
print("national_code is now NOT globally unique.")
print("Existing data has been preserved.")
print("========================================")