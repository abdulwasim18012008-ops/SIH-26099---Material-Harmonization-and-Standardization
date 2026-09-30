import sqlite3

conn = sqlite3.connect("sih.db")
cursor = conn.cursor()

columns = {
    "category": "TEXT",
    "technical_parameters": "TEXT",
    "raw_record": "TEXT"
}

existing_columns = {
    row[1]
    for row in cursor.execute(
        "PRAGMA table_info(original_materials)"
    ).fetchall()
}

for column_name, column_type in columns.items():

    if column_name not in existing_columns:
        cursor.execute(
            f"ALTER TABLE original_materials ADD COLUMN {column_name} {column_type}"
        )
        print(f"Added column: {column_name}")

    else:
        print(f"Already exists: {column_name}")

conn.commit()
conn.close()

print("Material table migration completed successfully.")