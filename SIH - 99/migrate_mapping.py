import sqlite3

conn = sqlite3.connect("sih.db")
cursor = conn.cursor()

try:
    cursor.execute(
        "ALTER TABLE material_mappings ADD COLUMN explanation TEXT"
    )
    print("explanation column added successfully")
except sqlite3.OperationalError as e:
    print("Migration result:", e)

conn.commit()
conn.close()