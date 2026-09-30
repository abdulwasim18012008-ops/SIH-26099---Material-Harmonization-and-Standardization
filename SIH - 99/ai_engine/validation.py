from datetime import datetime


VALID_STATUSES = {
    "PENDING",
    "APPROVED",
    "REJECTED",
    "MODIFIED"
}


def create_validation_record(
    group_id,
    ai_recommendation,
    status="PENDING",
    reviewer=None,
    comment=None,
    modified_description=None,
    modified_national_code=None,
    reviewed_at=None
):
    """
    Create a human validation record for an AI material recommendation.

    The AI recommendation is always preserved.
    Human decisions are stored separately.
    """

    status = status.upper()

    if status not in VALID_STATUSES:
        raise ValueError(
            f"Invalid status '{status}'. "
            f"Allowed statuses: {sorted(VALID_STATUSES)}"
        )

    if status == "MODIFIED":
        if not modified_description and not modified_national_code:
            raise ValueError(
                "MODIFIED status requires a modified description "
                "or modified national code."
            )

    if status in {"REJECTED", "MODIFIED"} and not comment:
        raise ValueError(
            f"{status} status requires a reviewer comment/reason."
        )

    if reviewed_at is None and status != "PENDING":
        reviewed_at = datetime.now().isoformat(timespec="seconds")

    final_description = None
    final_national_code = None

    if status == "APPROVED":
        final_description = ai_recommendation.get(
            "standardized_description"
        )
        final_national_code = ai_recommendation.get(
            "recommended_national_code"
        )

    elif status == "MODIFIED":
        final_description = (
            modified_description
            if modified_description
            else ai_recommendation.get("standardized_description")
        )

        final_national_code = (
            modified_national_code
            if modified_national_code
            else ai_recommendation.get("recommended_national_code")
        )

    return {
        "group_id": group_id,

        "status": status,

        "ai_recommendation": {
            "standardized_description": ai_recommendation.get(
                "standardized_description"
            ),
            "recommended_national_code": ai_recommendation.get(
                "recommended_national_code"
            ),
            "confidence": ai_recommendation.get(
                "confidence"
            )
        },

        "human_decision": {
            "final_description": final_description,
            "final_national_code": final_national_code,
            "reviewer": reviewer,
            "reviewed_at": reviewed_at,
            "comment": comment
        }
    }