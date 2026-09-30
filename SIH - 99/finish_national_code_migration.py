import sqlite3

DB_PATH = "sih.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("Finishing national code migration...")

# ---------------------------------------------------------
# 1. Remove the index created before the failed copy
# ---------------------------------------------------------

cursor.execute("""
    DROP INDEX IF EXISTS ix_standardized_materials_id
""")

print("Old index removed.")

# ---------------------------------------------------------
# 2. Check existing users
# ---------------------------------------------------------

print("\nExisting users:")

cursor.execute("""
    SELECT id, username
    FROM users
    ORDER BY id
""")

users = cursor.fetchall()

for user in users:
    print(user)

if not users:
    print("ERROR: No users found.")
    conn.close()
    raise SystemExit(1)

# Use the first existing user for legacy records
legacy_owner_id = users[0][0]

print(
    f"\nUsing owner_id={legacy_owner_id} "
    f"for old records that have no owner."
)

# ---------------------------------------------------------
# 3. Copy existing records
# ---------------------------------------------------------

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
        COALESCE(owner_id, ?),
        national_code,
        standard_description,
        category,
        status
    FROM standardized_materials_old
""", (legacy_owner_id,))

print("Existing standardized materials copied.")

# ---------------------------------------------------------
# 4. Create index
# ---------------------------------------------------------

cursor.execute("""
    CREATE INDEX IF NOT EXISTS ix_standardized_materials_id
    ON standardized_materials (id)
""")

print("New index created.")

# ---------------------------------------------------------
# 5. Remove old table
# ---------------------------------------------------------

cursor.execute("""
    DROP TABLE standardized_materials_old
""")

print("Old table removed.")

# ---------------------------------------------------------
# 6. Save
# ---------------------------------------------------------

conn.commit()

# ---------------------------------------------------------
# 7. Verify
# ---------------------------------------------------------

print("\nFinal standardized_materials structure:")

cursor.execute("""
    PRAGMA table_info(standardized_materials)
""")

for row in cursor.fetchall():
    print(row)

print("\nFinal indexes:")

cursor.execute("""
    PRAGMA index_list(standardized_materials)
""")

for row in cursor.fetchall():
    print(row)

print("\nChecking NULL owner_id values:")

cursor.execute("""
    SELECT COUNT(*)
    FROM standardized_materials
    WHERE owner_id IS NULL
""")

null_count = cursor.fetchone()[0]

print("NULL owner_id count:", null_count)

conn.close()

print("\n==========================================")
print("MIGRATION COMPLETED SUCCESSFULLY")
print("national_code is NOT globally unique.")
print("Existing data has been preserved.")
print("Legacy NULL owners were assigned to an existing user.")
print("==========================================")