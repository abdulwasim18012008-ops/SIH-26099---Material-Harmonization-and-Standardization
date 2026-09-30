from ai_engine.batch_processor import MaterialBatchProcessor
from ai_engine.validation import create_validation_record


class BatchMasterWorkflow:
    """
    End-to-end batch workflow for harmonizing materials
    across multiple CPSEs.
    """

    def __init__(self, master_workflow):
        self.master_workflow = master_workflow
        self.pipeline = master_workflow.pipeline

        self.batch_processor = MaterialBatchProcessor(
            self.pipeline
        )

    def process_batch(self, materials):
        """
        Analyze and group a complete batch of CPSE materials.

        No material is automatically approved.
        All groups enter human validation as PENDING.
        """

        batch_result = self.batch_processor.process(
            materials
        )

        validation_queue = []

        for group in batch_result["groups"]:

            group_id = group["group_id"]

            recommendation = {
    "standardized_description":
        group["standardized_description"],

    "recommended_national_code":
        group["recommended_national_code"],

    "confidence":
        group["national_code_confidence"],

    "classification_explanation":
        group.get(
            "classification_explanation",
            ""
        )
}

            validation = create_validation_record(
                group_id=group_id,
                ai_recommendation=recommendation,
                status="PENDING"
            )

            validation_queue.append({
                "group_id": group_id,
                "validation": validation,
                "members": group["members"]
            })

            self.master_workflow.audit_trail.log_action(
                action="BATCH_GROUP_CREATED",
                group_id=group_id,
                actor="AI_ENGINE",
                details={
                    "standardized_description":
                        group["standardized_description"],

                    "national_code":
                        group["recommended_national_code"],

                    "member_count":
                        group["member_count"]
                }
            )

            self.master_workflow.audit_trail.log_action(
                action="VALIDATION_PENDING",
                group_id=group_id,
                actor="SYSTEM",
                details={
                    "member_count":
                        group["member_count"]
                }
            )

        return {
            "total_materials":
                batch_result["total_materials"],

            "total_groups":
                batch_result["total_groups"],

            "groups":
                batch_result["groups"],

            "validation_queue":
                validation_queue
        }

    def approve_group(
        self,
        group,
        reviewer,
        comment
    ):
        """
        Approve one harmonized material group.

        The approved national material is mapped to every
        original CPSE material in the group.
        """

        group_id = group["group_id"]

        recommendation = {
    "standardized_description":
        group["standardized_description"],

    "recommended_national_code":
        group["recommended_national_code"],

    "confidence":
        group["national_code_confidence"],

    "classification_explanation":
        group.get(
            "classification_explanation",
            ""
        )
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

        # Record the actual human approval.
        self.master_workflow.audit_trail.log_action(
            action="VALIDATION_APPROVED",
            group_id=group_id,
            actor=reviewer,
            details={
                "comment": comment,
                "national_code": national_code,
                "member_count": len(group["members"])
            }
        )

        mappings = []
        versions = []

        for member in group["members"]:

            material_id = member["material_id"]
            cpse = member["cpse"]
            original_code = member["original_code"]

            mapping = (
                self.master_workflow.mapping_manager
                .create_mapping(
                    national_code=national_code,
                    standardized_description=
                        standardized_description,
                    cpse=cpse,
                    original_code=original_code,
                    material_id=material_id,
                    status="APPROVED"
                )
            )

            version = (
                self.master_workflow.version_manager
                .create_version(
                    material_id=material_id,
                    national_code=national_code,
                    standardized_description=
                        standardized_description,
                    status="APPROVED",
                    reviewer=reviewer,
                    comment=comment
                )
            )

            mappings.append(mapping)
            versions.append(version)

            self.master_workflow.audit_trail.log_action(
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

            self.master_workflow.audit_trail.log_action(
                action="VERSION_CREATED",
                material_id=material_id,
                group_id=group_id,
                actor=reviewer,
                details={
                    "version": version["version"]
                }
            )

        self.master_workflow.audit_trail.log_action(
            action="BATCH_GROUP_APPROVED",
            group_id=group_id,
            actor=reviewer,
            details={
                "member_count": len(group["members"]),
                "national_code": national_code
            }
        )

        return {
            "group_id": group_id,
            "validation": validation,
            "national_code": national_code,
            "standardized_description":
                standardized_description,
            "mappings": mappings,
            "versions": versions
        }