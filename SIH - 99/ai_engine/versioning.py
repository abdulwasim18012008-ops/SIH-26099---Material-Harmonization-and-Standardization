from datetime import datetime


class MaterialVersionManager:
    """
    Maintains version history for standardized material decisions.

    Every update creates a new version.
    Previous versions are never overwritten.
    """

    def __init__(self):
        self.versions = {}

    def create_version(
        self,
        material_id,
        national_code,
        standardized_description,
        status,
        reviewer=None,
        comment=None,
        timestamp=None
    ):
        if timestamp is None:
            timestamp = datetime.now().isoformat(timespec="seconds")

        if material_id not in self.versions:
            self.versions[material_id] = []

        version_number = len(self.versions[material_id]) + 1

        previous_version = None

        if self.versions[material_id]:
            previous_version = self.versions[material_id][-1]["version"]

        version = {
            "material_id": material_id,
            "version": version_number,
            "previous_version": previous_version,
            "national_code": national_code,
            "standardized_description": standardized_description,
            "status": status,
            "reviewer": reviewer,
            "timestamp": timestamp,
            "comment": comment
        }

        self.versions[material_id].append(version)

        return version

    def get_current_version(self, material_id):
        history = self.versions.get(material_id, [])

        if not history:
            return None

        return history[-1]

    def get_version_history(self, material_id):
        return self.versions.get(material_id, [])

    def get_specific_version(self, material_id, version_number):
        history = self.versions.get(material_id, [])

        for version in history:
            if version["version"] == version_number:
                return version

        return None