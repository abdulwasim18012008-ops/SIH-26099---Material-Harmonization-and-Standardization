from ai_engine.validation import create_validation_record
from ai_engine.mapping import MaterialMappingManager
from ai_engine.versioning import MaterialVersionManager
from ai_engine.audit import AuditTrail


class MaterialMasterWorkflow:
    """
    End-to-end workflow connecting the AI engine with
    validation, mapping, versioning, and audit trail.
    """

    def __init__(self, pipeline):
        self.pipeline = pipeline

        self.mapping_manager = MaterialMappingManager()
        self.version_manager = MaterialVersionManager()
        self.audit_trail = AuditTrail()

    def analyze_material(self, material, group_id=None):
        """
        Run the AI analysis stage.

        This does not approve anything.
        """

        material_id = material.get("material_id")
        cpse = material.get("cpse")
        original_code = material.get("original_code")
        description = material.get("description", "")

        analysis = self.pipeline.analyze_material(
            description,
            top_k=5
        )

        self.audit_trail.log_action(
            action="AI_ANALYSIS",
            material_id=material_id,
            group_id=group_id,
            actor="AI_ENGINE",
            details={
                "cpse": cpse,
                "original_code": original_code,
                "description": description,
                "national_code":
                    analysis["national_code"][
                        "recommended_national_code"
                    ],
                "confidence":
                    analysis["national_code"]["confidence"]
            }
        )

        return analysis

    def create_pending_validation(
        self,
        material,
        analysis,
        group_id=None
    ):
        """
        Create a human validation record from AI output.
        """

        material_id = material.get("material_id")

        if group_id is None:
            group_id = f"GROUP-{material_id}"

        recommendation = {
            "standardized_description":
                analysis["standardization"][
                    "standardized_description"
                ],

            "recommended_national_code":
                analysis["national_code"][
                    "recommended_national_code"
                ],

            "confidence":
                analysis["national_code"]["confidence"]
        }

        validation = create_validation_record(
            group_id=group_id,
            ai_recommendation=recommendation,
            status="PENDING"
        )

        self.audit_trail.log_action(
            action="VALIDATION_PENDING",
            material_id=material_id,
            group_id=group_id,
            actor="SYSTEM",
            details={
                "status": "PENDING",
                "national_code":
                    recommendation[
                        "recommended_national_code"
                    ]
            }
        )

        return validation

    def approve_material(
        self,
        material,
        analysis,
        group_id,
        reviewer,
        comment
    ):
        """
        Approve an AI recommendation after human review.
        """

        material_id = material.get("material_id")
        cpse = material.get("cpse")
        original_code = material.get("original_code")

        recommendation = {
            "standardized_description":
                analysis["standardization"][
                    "standardized_description"
                ],

            "recommended_national_code":
                analysis["national_code"][
                    "recommended_national_code"
                ],

            "confidence":
                analysis["national_code"]["confidence"]
        }

        validation = create_validation_record(
            group_id=group_id,
            ai_recommendation=recommendation,
            status="APPROVED",
            reviewer=reviewer,
            comment=comment
        )

        national_code = validation[
            "human_decision"
        ]["final_national_code"]

        standardized_description = validation[
            "human_decision"
        ]["final_description"]

        mapping = self.mapping_manager.create_mapping(
            national_code=national_code,
            standardized_description=
                standardized_description,
            cpse=cpse,
            original_code=original_code,
            material_id=material_id,
            status="APPROVED"
        )

        version = self.version_manager.create_version(
            material_id=material_id,
            national_code=national_code,
            standardized_description=
                standardized_description,
            status="APPROVED",
            reviewer=reviewer,
            comment=comment
        )

        self.audit_trail.log_action(
            action="VALIDATION_APPROVED",
            material_id=material_id,
            group_id=group_id,
            actor=reviewer,
            details={
                "comment": comment
            }
        )

        self.audit_trail.log_action(
            action="NATIONAL_MAPPING_CREATED",
            material_id=material_id,
            group_id=group_id,
            actor=reviewer,
            details={
                "national_code": national_code,
                "cpse": cpse,
                "original_code": original_code
            }
        )

        self.audit_trail.log_action(
            action="VERSION_CREATED",
            material_id=material_id,
            group_id=group_id,
            actor=reviewer,
            details={
                "version": version["version"]
            }
        )

        return {
            "validation": validation,
            "mapping": mapping,
            "version": version
        }

    def process_material(
        self,
        material,
        group_id=None
    ):
        """
        Run complete AI analysis and create a pending
        human-validation workflow.
        """

        if group_id is None:
            group_id = f"GROUP-{material.get('material_id')}"

        analysis = self.analyze_material(
            material,
            group_id=group_id
        )

        validation = self.create_pending_validation(
            material,
            analysis,
            group_id=group_id
        )

        return {
            "material": material,
            "analysis": analysis,
            "validation": validation
        }

    def get_material_history(self, material_id):
        return {
            "versions":
                self.version_manager.get_version_history(
                    material_id
                ),

            "audit":
                self.audit_trail.get_by_material(
                    material_id
                ),

            "mappings": [
                mapping
                for mapping in
                self.mapping_manager.get_all_mappings()
                if mapping["material_id"] == material_id
            ]
        }