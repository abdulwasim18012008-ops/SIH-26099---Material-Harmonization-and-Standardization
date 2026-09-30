from datetime import datetime


class AuditTrail:
    """
    Records important actions performed by the AI system,
    reviewers, and material governance workflow.
    """

    def __init__(self):
        self.records = []

    def log_action(
        self,
        action,
        material_id=None,
        group_id=None,
        actor="SYSTEM",
        details=None,
        timestamp=None
    ):
        if timestamp is None:
            timestamp = datetime.now().isoformat(timespec="seconds")

        audit_id = f"AUDIT-{len(self.records) + 1:04d}"

        record = {
            "audit_id": audit_id,
            "timestamp": timestamp,
            "action": action,
            "material_id": material_id,
            "group_id": group_id,
            "actor": actor,
            "details": details
        }

        self.records.append(record)

        return record

    def get_all_records(self):
        return self.records

    def get_by_material(self, material_id):
        return [
            record
            for record in self.records
            if record["material_id"] == material_id
        ]

    def get_by_group(self, group_id):
        return [
            record
            for record in self.records
            if record["group_id"] == group_id
        ]

    def get_by_action(self, action):
        return [
            record
            for record in self.records
            if record["action"] == action
        ]