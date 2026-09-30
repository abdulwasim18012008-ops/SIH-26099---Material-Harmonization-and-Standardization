import numpy as np


class SemanticMaterialClassifier:
    """
    Semantic material classification using the existing
    sentence-transformer embedding model.

    Classification is performed by comparing the material
    description against a structured industrial ontology.
    """

    ONTOLOGY = [

        # =========================
        # FASTENERS
        # =========================

        {
            "category": "fastener",
            "subcategory": "bolt",
            "description": (
                "Bolt. A mechanical threaded fastener used to join "
                "two or more components. Common industrial examples "
                "include hex bolt, machine bolt, structural bolt and "
                "stainless steel bolt. Typical specifications include "
                "thread diameter such as M10 or M20, length, grade, "
                "material and thread specification."
            )
        },

        {
            "category": "fastener",
            "subcategory": "nut",
            "description": (
                "Nut. A threaded mechanical fastening component "
                "designed to mate with a bolt or threaded stud. "
                "Examples include hex nut, lock nut, self-locking nut "
                "and stainless steel nut. Typical specifications "
                "include thread size, material and grade."
            )
        },

        {
            "category": "fastener",
            "subcategory": "washer",
            "description": (
                "Washer. A mechanical fastening component placed "
                "under a nut or bolt head to distribute load and "
                "protect the mating surface. Examples include flat "
                "washer, spring washer and locking washer."
            )
        },

        {
            "category": "fastener",
            "subcategory": "screw",
            "description": (
                "Screw. A threaded mechanical fastener used to "
                "secure components or materials. Examples include "
                "machine screw, self tapping screw and socket head "
                "screw."
            )
        },

        # =========================
        # PIPING
        # =========================

        {
            "category": "piping",
            "subcategory": "pipe",
            "description": (
                "Pipe. An industrial tubular component used to "
                "transport liquids, gases or process fluids. "
                "Examples include carbon steel pipe, stainless steel "
                "pipe and process pipe. Typical specifications include "
                "nominal diameter, DN or NB, schedule such as SCH40 "
                "or SCH80, wall thickness, pressure and material."
            )
        },

        {
            "category": "piping",
            "subcategory": "elbow",
            "description": (
                "Elbow. A pipe fitting used to change the direction "
                "of a piping system. Common examples are 45 degree "
                "elbow and 90 degree elbow. Typical specifications "
                "include nominal diameter, DN or NB, schedule, material "
                "and pressure rating."
            )
        },

        {
            "category": "piping",
            "subcategory": "tee",
            "description": (
                "Tee. A pipe fitting with a branch connection used "
                "to divide or combine fluid flow. Examples include "
                "equal tee and reducing tee. Typical specifications "
                "include pipe diameter, branch diameter, material and "
                "pressure rating."
            )
        },

        {
            "category": "piping",
            "subcategory": "reducer",
            "description": (
                "Reducer. A piping fitting used to connect pipes "
                "having different nominal diameters. Examples include "
                "concentric reducer and eccentric reducer. Typical "
                "specifications include inlet diameter, outlet diameter, "
                "material, schedule and pressure rating."
            )
        },

        {
            "category": "piping",
            "subcategory": "flange",
            "description": (
                "Flange. A mechanical piping component used to join "
                "pipes, valves, pumps and other equipment. Examples "
                "include weld neck flange, slip on flange and blind "
                "flange. Typical specifications include nominal "
                "diameter, pressure class, material and standard."
            )
        },

        # =========================
        # VALVES
        # =========================

        {
            "category": "valve",
            "subcategory": "gate valve",
            "description": (
                "Gate valve. An industrial valve used primarily to "
                "start or stop fluid flow using a gate mechanism. "
                "Common specifications include DN or nominal bore, "
                "pressure rating such as PN16, material and valve "
                "standard."
            )
        },

        {
            "category": "valve",
            "subcategory": "globe valve",
            "description": (
                "Globe valve. An industrial valve using a movable "
                "disc or plug and seat to regulate or isolate fluid "
                "flow. Typical specifications include nominal size, "
                "pressure rating, material and end connection."
            )
        },

        {
            "category": "valve",
            "subcategory": "ball valve",
            "description": (
                "Ball valve. A quarter turn industrial valve using "
                "a spherical ball with a passage to control fluid "
                "flow. Typical specifications include bore, nominal "
                "diameter, pressure rating and material."
            )
        },

        {
            "category": "valve",
            "subcategory": "check valve",
            "description": (
                "Check valve. A non-return industrial valve designed "
                "to allow fluid flow in one direction and prevent "
                "reverse flow. Examples include swing check valve and "
                "lift check valve."
            )
        },

        {
            "category": "valve",
            "subcategory": "butterfly valve",
            "description": (
                "Butterfly valve. A quarter turn industrial valve "
                "using a rotating disc to control fluid flow in a "
                "pipeline. Typical specifications include DN, pressure "
                "rating, body material and seat material."
            )
        },

        # =========================
        # BEARINGS
        # =========================

        {
            "category": "bearing",
            "subcategory": "ball bearing",
            "description": (
                "Ball bearing. A rolling element bearing that uses "
                "balls between races to support rotating shafts and "
                "reduce friction. Examples include deep groove ball "
                "bearing and angular contact ball bearing. Bearings "
                "are commonly identified by bearing numbers such as "
                "6205 or 6305."
            )
        },

        {
            "category": "bearing",
            "subcategory": "roller bearing",
            "description": (
                "Roller bearing. A rolling element bearing using "
                "cylindrical, spherical or tapered rollers to support "
                "rotating machinery. Examples include cylindrical "
                "roller bearing and tapered roller bearing."
            )
        },

        # =========================
        # ELECTRICAL EQUIPMENT
        # =========================

        {
            "category": "electrical",
            "subcategory": "transformer",
            "description": (
                "Transformer. Electrical power equipment that transfers "
                "electrical energy between circuits through electromagnetic "
                "induction and changes voltage or current levels. "
                "Examples include power transformer, distribution "
                "transformer, step up transformer, step down transformer, "
                "oil immersed transformer and dry type transformer. "
                "Typical specifications include MVA rating, primary "
                "voltage, secondary voltage, frequency and IEC transformer "
                "standards such as IEC 60076."
            )
        },

        {
            "category": "electrical",
            "subcategory": "motor",
            "description": (
                "Electric motor. An electrical machine that converts "
                "electrical energy into mechanical rotational energy. "
                "Examples include induction motor, AC motor, three phase "
                "motor and electric motor. Typical specifications include "
                "power in kW or HP, voltage such as 415 V, frequency such "
                "as 50 Hz, speed and number of phases."
            )
        },

        {
            "category": "electrical",
            "subcategory": "cable",
            "description": (
                "Electrical cable. An insulated conductor or group of "
                "conductors used to transmit electrical power or signals. "
                "Examples include power cable, control cable, multicore "
                "cable and instrumentation cable. Typical specifications "
                "include voltage rating, conductor size, number of cores "
                "and insulation material."
            )
        },

        {
            "category": "electrical",
            "subcategory": "circuit breaker",
            "description": (
                "Circuit breaker. An electrical switching and protection "
                "device designed to interrupt current during abnormal "
                "conditions such as overload or short circuit. Examples "
                "include MCB, MCCB, ACB and vacuum circuit breaker."
            )
        },

        {
            "category": "electrical",
            "subcategory": "contactor",
            "description": (
                "Contactor. An electrically controlled switching device "
                "used for repeatedly switching electrical power circuits, "
                "especially motors and industrial loads. Typical "
                "specifications include coil voltage, current rating "
                "and number of poles."
            )
        },

        {
            "category": "electrical",
            "subcategory": "relay",
            "description": (
                "Relay. An electrically operated switching device used "
                "for control, protection, automation or signal switching "
                "in electrical systems. Examples include protection relay, "
                "control relay and overload relay."
            )
        },

        # =========================
        # ROTATING EQUIPMENT
        # =========================

        {
            "category": "rotating_equipment",
            "subcategory": "pump",
            "description": (
                "Pump. Mechanical process equipment used to move liquids "
                "or other fluids by adding pressure or mechanical energy. "
                "Examples include centrifugal pump, positive displacement "
                "pump and process pump. Typical specifications include "
                "flow rate, head, pressure, power and material."
            )
        },

        {
            "category": "rotating_equipment",
            "subcategory": "compressor",
            "description": (
                "Compressor. Mechanical equipment used to increase the "
                "pressure of gases. Examples include centrifugal compressor, "
                "reciprocating compressor and screw compressor. Typical "
                "specifications include gas service, pressure, capacity "
                "and power."
            )
        },

        {
            "category": "rotating_equipment",
            "subcategory": "coupling",
            "description": (
                "Coupling. A mechanical component used to connect two "
                "shafts and transmit rotational torque between them. "
                "Examples include flexible coupling, rigid coupling and "
                "gear coupling."
            )
        },

        # =========================
        # SEALING
        # =========================

        {
            "category": "sealing",
            "subcategory": "gasket",
            "description": (
                "Gasket. A sealing component placed between two mating "
                "surfaces to prevent leakage of fluids or gases. "
                "Examples include spiral wound gasket, ring gasket and "
                "compressed sheet gasket. Typical specifications include "
                "material, pressure rating, temperature rating and size."
            )
        },

        {
            "category": "sealing",
            "subcategory": "mechanical seal",
            "description": (
                "Mechanical seal. A sealing device used around a rotating "
                "shaft to prevent leakage between stationary and rotating "
                "components, commonly used in pumps and rotating equipment."
            )
        },

        # =========================
        # FILTRATION
        # =========================

        {
            "category": "filtration",
            "subcategory": "filter",
            "description": (
                "Filter. An industrial component or equipment used to "
                "remove particles, contaminants or impurities from a "
                "liquid or gas stream. Examples include cartridge filter, "
                "bag filter, air filter and process filter."
            )
        },

        # =========================
        # INSTRUMENTATION
        # =========================

        {
            "category": "instrumentation",
            "subcategory": "pressure gauge",
            "description": (
                "Pressure gauge. An industrial measuring instrument used "
                "to indicate or measure fluid or gas pressure. Typical "
                "specifications include pressure range, pressure unit, "
                "connection size and accuracy."
            )
        },

        {
            "category": "instrumentation",
            "subcategory": "temperature instrument",
            "description": (
                "Temperature measuring instrument used to measure or "
                "indicate process temperature. Examples include temperature "
                "gauge, thermometer, RTD and thermocouple."
            )
        },

        {
            "category": "instrumentation",
            "subcategory": "flow meter",
            "description": (
                "Flow meter. An industrial measuring instrument used to "
                "measure the rate of liquid or gas flow through a process "
                "line. Typical specifications include flow range, pipe "
                "diameter and process medium."
            )
        },

        # =========================
        # HEAT TRANSFER
        # =========================

        {
            "category": "heat_transfer",
            "subcategory": "heat exchanger",
            "description": (
                "Heat exchanger. Process equipment used to transfer heat "
                "between two fluids without directly mixing them. "
                "Examples include shell and tube heat exchanger and "
                "plate heat exchanger. Typical specifications include "
                "heat duty, pressure, temperature and materials."
            )
        },

        # =========================
        # PPE
        # =========================

        {
            "category": "ppe",
            "subcategory": "safety goggles",
            "description": (
                "Safety goggles. Personal protective equipment designed "
                "to protect the eyes from particles, chemicals, dust, "
                "splashes and workplace hazards. Examples include clear "
                "lens safety goggles and chemical splash goggles. "
                "Common standards include EN 166."
            )
        },

        {
            "category": "ppe",
            "subcategory": "safety gloves",
            "description": (
                "Safety gloves. Personal protective equipment designed "
                "to protect hands from mechanical, chemical, thermal or "
                "other workplace hazards."
            )
        },

        {
            "category": "ppe",
            "subcategory": "safety helmet",
            "description": (
                "Safety helmet. Personal protective equipment designed "
                "to protect the head from impact, falling objects and "
                "industrial workplace hazards."
            )
        }
    ]

    def __init__(self, embedding_model):
        self.embedding_model = embedding_model

        self.ontology_embeddings = []

        for item in self.ONTOLOGY:
            embedding = self.embedding_model.encode(
                item["description"]
            )

            self.ontology_embeddings.append(
                np.asarray(
                    embedding,
                    dtype="float32"
                )
            )

        self.ontology_embeddings = np.vstack(
            self.ontology_embeddings
        )

    def classify(self, description: str, top_k: int = 3) -> dict:

        if not description or not description.strip():
            return {
                "category": "unknown",
                "subcategory": None,
                "confidence": 0.0,
                "matched_concept": None,
                "alternatives": [],
                "explanation": "Material description is empty.",
                "human_validation_required": True
            }

        query_embedding = np.asarray(
            self.embedding_model.encode(description),
            dtype="float32"
        )

        scores = self.ontology_embeddings @ query_embedding

        ranked_indices = np.argsort(scores)[::-1]

        best_index = int(ranked_indices[0])
        best_score = float(scores[best_index])

        best_item = self.ONTOLOGY[best_index]

        alternatives = []

        for index in ranked_indices[1:top_k]:
            item = self.ONTOLOGY[int(index)]

            alternatives.append({
                "category": item["category"],
                "subcategory": item["subcategory"],
                "similarity": round(
                    float(scores[index]),
                    4
                )
            })

        confidence = max(
            0.0,
            min(
                1.0,
                best_score
            )
        )

        if confidence >= 0.90:
            validation_status = "HIGH_CONFIDENCE"
            human_validation_required = False

        elif confidence >= 0.70:
            validation_status = "REVIEW_RECOMMENDED"
            human_validation_required = True

        else:
            validation_status = "HUMAN_REQUIRED"
            human_validation_required = True

        explanation = (
            f"Semantic match to the industrial ontology concept "
            f"'{best_item['subcategory']}' with similarity "
            f"{best_score:.4f}."
        )

        return {
            "category": best_item["category"],
            "subcategory": best_item["subcategory"],
            "confidence": round(
                confidence,
                4
            ),
            "matched_concept": best_item["description"],
            "alternatives": alternatives,
            "explanation": explanation,
            "validation_status": validation_status,
            "human_validation_required": human_validation_required
        }