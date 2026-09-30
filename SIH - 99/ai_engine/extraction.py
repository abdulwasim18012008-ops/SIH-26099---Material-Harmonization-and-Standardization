import re


def extract_attributes(text: str) -> dict:
    """
    Extract normalized technical attributes from an industrial
    material description.

    This is a domain-aware extraction layer. It does not assign
    national material codes or make material-specific decisions.
    """

    text = str(text or "").lower().strip()

    attributes = {
        "material": None,
        "type": None,
        "grade": None,
        "diameter": None,
        "length": None,
        "width": None,
        "thickness": None,
        "standard": None,
        "bearing_code": None,

        # Generic industrial technical parameters
        "nominal_diameter": None,
        "pressure": None,
        "voltage": None,
        "power": None,
        "frequency": None,
        "schedule": None,
        "angle": None,
        "thread": None,
        "head_type": None
    }

    # =========================================================
    # MATERIAL
    # =========================================================

    material_patterns = [
        (
            "stainless steel",
            [
                r"\bstainless\s+steel\b",
                r"\bss\s*\d{2,4}\b",
                r"\bs\.s\.\b",
                r"\bss\b"
            ]
        ),
        (
            "carbon steel",
            [
                r"\bcarbon\s+steel\b",
                r"\bcs\b"
            ]
        ),
        (
            "mild steel",
            [
                r"\bmild\s+steel\b",
                r"\bms\b"
            ]
        ),
        (
            "alloy steel",
            [
                r"\balloy\s+steel\b"
            ]
        ),
        (
            "cast iron",
            [
                r"\bcast\s+iron\b",
                r"\bci\b"
            ]
        ),
        (
            "ductile iron",
            [
                r"\bductile\s+iron\b",
                r"\bdi\b"
            ]
        ),
        (
            "aluminium",
            [
                r"\baluminium\b",
                r"\baluminum\b",
                r"\bal\b"
            ]
        ),
        (
            "copper",
            [
                r"\bcopper\b",
                r"\bcu\b"
            ]
        ),
        (
            "brass",
            [
                r"\bbrass\b"
            ]
        )
    ]

    for material_name, patterns in material_patterns:
        if any(re.search(pattern, text, re.IGNORECASE)
               for pattern in patterns):
            attributes["material"] = material_name
            break

    # =========================================================
    # TYPE
    # =========================================================

    # Longer/more specific phrases are checked before generic terms.
    type_patterns = [
        ("safety_goggles", [
            r"\bsafety\s+goggles?\b",
            r"\bprotective\s+goggles?\b",
            r"\beye\s+protection\b"
        ]),

        ("safety_gloves", [
            r"\bsafety\s+gloves?\b",
            r"\bprotective\s+gloves?\b"
        ]),

        ("safety_helmet", [
            r"\bsafety\s+helmets?\b",
            r"\bprotective\s+helmets?\b"
        ]),

        ("safety_shoes", [
            r"\bsafety\s+shoes?\b",
            r"\bsafety\s+boots?\b"
        ]),

        ("transformer", [
            r"\bpower\s+transformers?\b",
            r"\bdistribution\s+transformers?\b",
            r"\btransformers?\b",
            r"\bxfmr\b"
        ]),

        ("circuit_breaker", [
            r"\bcircuit\s+breakers?\b",
            r"\bmcbs?\b",
            r"\bmccbs?\b",
            r"\bacbs?\b",
            r"\bvcbs?\b"
        ]),

        ("contactor", [
            r"\bcontactors?\b"
        ]),

        ("relay", [
            r"\brelays?\b"
        ]),

        ("cable", [
            r"\bcables?\b"
        ]),

        ("wire", [
            r"\bwires?\b"
        ]),

        ("hose", [
            r"\bhoses?\b"
        ]),

        ("filter", [
            r"\bfilters?\b"
        ]),

        ("compressor", [
            r"\bcompressors?\b"
        ]),

        ("fan", [
            r"\bfans?\b"
        ]),

        ("blower", [
            r"\bblowers?\b"
        ]),

        ("gearbox", [
            r"\bgear\s*boxes?\b",
            r"\bgearboxes?\b"
        ]),

        ("coupling", [
            r"\bcouplings?\b"
        ]),

        ("shaft", [
            r"\bshafts?\b"
        ]),

        ("pump", [
            r"\bpumps?\b"
        ]),

        ("motor", [
            r"\bmotors?\b"
        ]),
        ("elbow", [
            r"\belbows?\b"
        ]),
        ("flange", [
            r"\bflanges?\b"
        ]),

        ("valve", [
            r"\bvalves?\b"
        ]),

        ("bearing", [
            r"\bbearings?\b"
        ]),

        ("gasket", [
            r"\bgaskets?\b"
        ]),

        ("seal", [
            r"\bseals?\b"
        ]),

        ("bolt", [
            r"\bbolts?\b"
        ]),

        ("nut", [
            r"\bnuts?\b"
        ]),

        ("washer", [
            r"\bwashers?\b"
        ]),

        ("screw", [
            r"\bscrews?\b"
        ]),

        ("stud", [
            r"\bstuds?\b"
        ]),

        ("pipe", [
            r"\bpipes?\b"
        ]),

        ("tube", [
            r"\btubes?\b"
        ])
    ]

    for item_type, patterns in type_patterns:
        if any(re.search(pattern, text, re.IGNORECASE)
               for pattern in patterns):
            attributes["type"] = item_type
            break

    # =========================================================
    # BEARING CODE
    # =========================================================

    if attributes["type"] == "bearing":

        bearing_patterns = [
            r"\b(?:bearing\s*)?(\d{4,5})\b"
        ]

        for pattern in bearing_patterns:

            bearing_match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if bearing_match:
                attributes["bearing_code"] = (
                    bearing_match.group(1)
                )
                break

    # =========================================================
    # GRADE
    # =========================================================

    # SS304 / SS 304 / SS-304
    ss_grade = re.search(
        r"\bss[\s-]?(\d{2,4})\b",
        text,
        re.IGNORECASE
    )

    if ss_grade:
        attributes["grade"] = (
            "SS" + ss_grade.group(1)
        )

    # GR B7 / GRADE B7
    if attributes["grade"] is None:

        grade_match = re.search(
            r"\b(?:gr|grade)\s*([a-z0-9.-]+)\b",
            text,
            re.IGNORECASE
        )

        if grade_match:
            attributes["grade"] = (
                grade_match.group(1).upper()
            )

    # =========================================================
    # STANDARD
    # =========================================================

    standard_patterns = [
        # ASTM A193 / ASTM A320 / ASTM F593
        r"\b(astm\s+[a-z]?\d+[a-z]?)\b",

        # IS 1363 / IS 1239-1
        r"\b(is\s+\d+(?:[-/]\d+)?)\b",

        # IEC 60076 / IEC 60947-2
        r"\b(iec\s+\d+(?:[-/]\d+)?)\b",

        # ISO 9001 / ISO 45001
        r"\b(iso\s+\d+(?:[-/]\d+)?)\b",

        # EN 166 / EN 10204
        r"\b(en\s+\d+(?:[-/]\d+)?)\b",

        # API 6D / API 5L
        r"\b(api\s+\d+[a-z]?)\b"
    ]

    for pattern in standard_patterns:

        standard_match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if standard_match:
            attributes["standard"] = (
                standard_match.group(1).upper()
            )
            break

    # =========================================================
    # DIAMETER
    # =========================================================

    # 10 DIA / 10 DIAMETER
    diameter_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(?:dia|diameter)\b",
        text,
        re.IGNORECASE
    )

    # DIA 10 / DIAMETER 10
    if not diameter_match:

        diameter_match = re.search(
            r"\b(?:dia|diameter)\s*(\d+(?:\.\d+)?)\b",
            text,
            re.IGNORECASE
        )

    # M10 / M12 / M20
    if not diameter_match:

        diameter_match = re.search(
            r"\bm(\d+(?:\.\d+)?)\b",
            text,
            re.IGNORECASE
        )

    # 25 MM DIA / 25 MM DIAMETER
    if not diameter_match:

        diameter_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*mm\s*"
            r"(?:dia|diameter)\b",
            text,
            re.IGNORECASE
        )

    # PIPE 25 MM / VALVE 25 MM
    if (
        not diameter_match
        and attributes["type"] in ["pipe", "tube", "valve"]
    ):

        diameter_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*mm\b",
            text,
            re.IGNORECASE
        )

    if diameter_match:

        attributes["diameter"] = (
            diameter_match.group(1) + " mm"
        )

    # =========================================================
    # LENGTH
    # =========================================================

    # M10 X 50
    # M10 X 50 MM
    dimension_match = re.search(
        r"\bm(\d+(?:\.\d+)?)\s*[x×]\s*"
        r"(\d+(?:\.\d+)?)(?:\s*mm)?\b",
        text,
        re.IGNORECASE
    )

    if dimension_match:

        attributes["diameter"] = (
            dimension_match.group(1) + " mm"
        )

        attributes["length"] = (
            dimension_match.group(2) + " mm"
        )

    # 50 LENGTH / 50 LG / 50 LEN
    if attributes["length"] is None:

        length_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*"
            r"(?:length|lg|len)\b",
            text,
            re.IGNORECASE
        )

        if length_match:

            attributes["length"] = (
                length_match.group(1) + " mm"
            )

    # LENGTH 50 / LG 50 / LEN 50
    if attributes["length"] is None:

        length_match = re.search(
            r"\b(?:length|lg|len)\s*"
            r"(\d+(?:\.\d+)?)\b",
            text,
            re.IGNORECASE
        )

        if length_match:

            attributes["length"] = (
                length_match.group(1) + " mm"
            )

    # 10 MM X 50 MM
    if attributes["length"] is None:

        two_dimension_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*mm\s*[x×]\s*"
            r"(\d+(?:\.\d+)?)\s*mm\b",
            text,
            re.IGNORECASE
        )

        if two_dimension_match:

            first_value = two_dimension_match.group(1)
            second_value = two_dimension_match.group(2)

            if attributes["diameter"] == (
                first_value + " mm"
            ):

                attributes["length"] = (
                    second_value + " mm"
                )

    # Bolt fallback:
    # SS BOLT M10 50MM
    if (
        attributes["length"] is None
        and attributes["type"] == "bolt"
    ):

        dimensions = re.findall(
            r"\b(\d+(?:\.\d+)?)\s*mm\b",
            text,
            re.IGNORECASE
        )

        for value in dimensions:

            if attributes["diameter"] != (
                value + " mm"
            ):

                attributes["length"] = (
                    value + " mm"
                )

                break

    # =========================================================
    # PIPE / HOSE LENGTH
    # =========================================================

    pipe_length = re.search(
        r"\b[x×]\s*(\d+(?:\.\d+)?)\s*"
        r"(mtr|meter|metre|m)\b",
        text,
        re.IGNORECASE
    )

    if pipe_length:

        value = float(
            pipe_length.group(1)
        )

        value_mm = int(
            value * 1000
        )

        attributes["length"] = (
            str(value_mm) + " mm"
        )

    # =========================================================
    # THICKNESS
    # =========================================================

    # 2 MM THK / 2 MM THICKNESS
    thickness_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*mm\s*"
        r"(?:thk|thickness)\b",
        text,
        re.IGNORECASE
    )

    # THK 2 MM / THICKNESS 2 MM
    if not thickness_match:

        thickness_match = re.search(
            r"\b(?:thk|thickness)\s*"
            r"(\d+(?:\.\d+)?)\s*mm?\b",
            text,
            re.IGNORECASE
        )

    if thickness_match:

        attributes["thickness"] = (
            thickness_match.group(1) + " mm"
        )

    # =========================================================
    # WIDTH
    # =========================================================

    width_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*mm\s*"
        r"(?:wide|width)\b",
        text,
        re.IGNORECASE
    )

    if width_match:

        attributes["width"] = (
            width_match.group(1) + " mm"
        )
    # =========================================================
    # GENERIC INDUSTRIAL TECHNICAL PARAMETERS
    # =========================================================

    # ---------------------------------------------------------
        # NOMINAL DIAMETER
    # Examples:
    # DN100
    # DN 100
    # NB100
    # NB 100
    # ---------------------------------------------------------

    nominal_diameter_match = re.search(
        r"\b(?:dn|nb)\s*(\d+(?:\.\d+)?)\b"
        r"|\b(\d+(?:\.\d+)?)\s*(?:dn|nb)\b",
        text,
        re.IGNORECASE
    )

    if nominal_diameter_match:
        diameter_value = (
            nominal_diameter_match.group(1)
            if nominal_diameter_match.group(1)
            else nominal_diameter_match.group(2)
        )

        attributes["nominal_diameter"] = (
            "DN " +
            diameter_value +
            " mm"
        )

    
    # ---------------------------------------------------------
    # PRESSURE
    # Examples:
    # 10 bar
    # 10BAR
    # PN16
    # 0-10 bar
    # ---------------------------------------------------------

    pressure_range_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*"
        r"(?:-|to)\s*"
        r"(\d+(?:\.\d+)?)\s*bar\b",
        text,
        re.IGNORECASE
    )

    if pressure_range_match:
        attributes["pressure"] = (
            pressure_range_match.group(1) +
            "-" +
            pressure_range_match.group(2) +
            " bar"
        )

    else:
        pressure_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*bar\b",
            text,
            re.IGNORECASE
        )

        if pressure_match:
            attributes["pressure"] = (
                pressure_match.group(1) +
                " bar"
            )

        else:
            pn_match = re.search(
                r"\bpn\s*(\d+(?:\.\d+)?)\b",
                text,
                re.IGNORECASE
            )

            if pn_match:
                attributes["pressure"] = (
                    "PN" +
                    pn_match.group(1)
                )

    # ---------------------------------------------------------
    # ELECTRICAL VOLTAGE
    # Examples:
    # 415V
    # 415 V
    # 230 volts
    # ---------------------------------------------------------

    voltage_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*"
        r"(?:v|volt|volts)\b",
        text,
        re.IGNORECASE
    )

    if voltage_match:
        attributes["voltage"] = (
            voltage_match.group(1) +
            " V"
        )

        # ---------------------------------------------------------
    # POWER
    # Examples:
    # 15 kW
    # 5.5 kW
    # 10 HP
    # 40 MVA
    # ---------------------------------------------------------

    power_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*"
        r"(kw|mw|mva|kva|hp)\b",
        text,
        re.IGNORECASE
    )

    if power_match:
        attributes["power"] = (
            power_match.group(1) +
            " " +
            power_match.group(2).upper()
        )

    # ---------------------------------------------------------
    # FREQUENCY
    # Examples:
    # 50 Hz
    # 60Hz
    # ---------------------------------------------------------

    frequency_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*hz\b",
        text,
        re.IGNORECASE
    )

    if frequency_match:
        attributes["frequency"] = (
            frequency_match.group(1) +
            " Hz"
        )

    # ---------------------------------------------------------
    # PIPE SCHEDULE
    # Examples:
    # SCH40
    # SCH 40
    # SCHEDULE 40
    # ---------------------------------------------------------

    schedule_match = re.search(
        r"\b(?:sch|schedule)\s*"
        r"(\d+(?:\.\d+)?)\b",
        text,
        re.IGNORECASE
    )

    if schedule_match:
        attributes["schedule"] = (
            "SCH" +
            schedule_match.group(1)
        )

    # ---------------------------------------------------------
    # ANGLE
    # Examples:
    # 90 degree
    # 45°
    # 90 deg
    # ---------------------------------------------------------

    angle_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*"
        r"(?:degree|degrees|deg)\b",
        text,
        re.IGNORECASE
    )

    if not angle_match:
        angle_match = re.search(
            r"\b(\d+(?:\.\d+)?)\s*°",
            text,
            re.IGNORECASE
        )

    if angle_match:
        attributes["angle"] = (
            angle_match.group(1) +
            " degree"
        )

    # ---------------------------------------------------------
    # THREAD
    # Examples:
    # M10 thread
    # M20 X 1.5
    # 1/2 UNC
    # ---------------------------------------------------------

    thread_match = re.search(
        r"\b(m\d+(?:\.\d+)?"
        r"(?:\s*[x×]\s*\d+(?:\.\d+)?)?"
        r"(?:\s*(?:coarse|fine))?"
        r")\s*thread\b",
        text,
        re.IGNORECASE
    )

    if thread_match:
        attributes["thread"] = (
            thread_match.group(1).upper()
        )

    # ---------------------------------------------------------
    # HEAD TYPE
    # Examples:
    # hex bolt
    # hex head
    # socket head
    # countersunk
    # ---------------------------------------------------------

    head_patterns = [
        (
            "hex",
            r"\bhex(?:agonal)?\s+"
            r"(?:head\s+)?(?:bolt|screw)\b"
        ),
        (
            "socket",
            r"\bsocket\s+head\b"
        ),
        (
            "countersunk",
            r"\bcountersunk\b"
        ),
        (
            "pan",
            r"\bpan\s+head\b"
        ),
        (
            "flat",
            r"\bflat\s+head\b"
        )
    ]

    for head_name, pattern in head_patterns:

        if re.search(
            pattern,
            text,
            re.IGNORECASE
        ):
            attributes["head_type"] = head_name
            break
    # =========================================================
    # RETURN
    # =========================================================

    return attributes