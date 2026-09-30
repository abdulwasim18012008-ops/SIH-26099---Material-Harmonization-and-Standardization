import sqlite3

DB_PATH = "sih.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # ---------------------------------------------------------
    # USERS TABLE
    # ---------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # ---------------------------------------------------------
    # CPSE
    # ---------------------------------------------------------
    columns = [row[1] for row in cursor.execute("PRAGMA table_info(cpse)")]

    if "is_master" not in columns:
        cursor.execute("""
            ALTER TABLE cpse
            ADD COLUMN is_master INTEGER NOT NULL DEFAULT 0
        """)

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE cpse
            ADD COLUMN owner_id INTEGER
        """)

    # ---------------------------------------------------------
    # ORIGINAL MATERIALS
    # ---------------------------------------------------------
    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(original_materials)"
        )
    ]

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE original_materials
            ADD COLUMN owner_id INTEGER
        """)

    # ---------------------------------------------------------
    # STANDARDIZED MATERIALS
    # ---------------------------------------------------------
    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(standardized_materials)"
        )
    ]

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE standardized_materials
            ADD COLUMN owner_id INTEGER
        """)

    # ---------------------------------------------------------
    # MATERIAL MAPPINGS
    # ---------------------------------------------------------
    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(material_mappings)"
        )
    ]

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE material_mappings
            ADD COLUMN owner_id INTEGER
        """)

    # ---------------------------------------------------------
    # AUDIT LOGS
    # ---------------------------------------------------------
    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(audit_logs)"
        )
    ]

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE audit_logs
            ADD COLUMN owner_id INTEGER
        """)

    # ---------------------------------------------------------
    # MATERIAL VERSIONS
    # ---------------------------------------------------------
    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(material_versions)"
        )
    ]

    if "owner_id" not in columns:
        cursor.execute("""
            ALTER TABLE material_versions
            ADD COLUMN owner_id INTEGER
        """)

    conn.commit()

    print()
    print("==========================================")
    print("MULTI-USER DATABASE MIGRATION SUCCESSFUL")
    print("==========================================")

except Exception as e:
    conn.rollback()
    print("MIGRATION FAILED:", e)

finally:
    conn.close()