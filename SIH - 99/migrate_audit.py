import sqlite3

conn = sqlite3.connect("sih.db")
cursor = conn.cursor()

columns = {
    "entity_id": "INTEGER",
    "old_value": "TEXT",
    "new_value": "TEXT",
    "user": "TEXT",
    "reason": "TEXT"
}

existing_columns = {
    row[1]
    for row in cursor.execute("PRAGMA table_info(audit_logs)").fetchall()
}

for column_name, column_type in columns.items():
    if column_name not in existing_columns:
        cursor.execute(
            f"ALTER TABLE audit_logs ADD COLUMN {column_name} {column_type}"
        )
        print(f"Added column: {column_name}")
    else:
        print(f"Already exists: {column_name}")

conn.commit()
conn.close()

print("Audit table migration completed successfully.")