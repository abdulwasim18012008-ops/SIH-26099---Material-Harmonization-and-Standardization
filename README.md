# SIH-26099 — AI-Driven Material Harmonization and Standardization

## Smart India Hackathon 2026

**Problem Statement:** SIH-26099  
**Theme:** Smart Automation  
**Domain:** Software  
**Team:** CTRLZ1

---

## 1. Problem Statement

Central Public Sector Enterprises (CPSEs) maintain material master data across different ERP systems and organizational environments. The same or functionally equivalent material can be recorded using different descriptions, abbreviations, specifications, and material codes.

This creates challenges such as:

- Duplicate and near-duplicate material records
- Inconsistent material descriptions
- Difficulty identifying equivalent materials across CPSEs
- Repeated material creation
- Reduced visibility of aggregated demand
- Difficulties in material master rationalization and migration

The objective of this project is to develop an AI-driven framework for standardizing and harmonizing material master data while preserving traceability to the original CPSE material codes.

---

## 2. Solution Overview

Our solution provides an AI-powered material harmonization pipeline that analyzes material descriptions and technical attributes, identifies similar materials, recommends standardized descriptions, generates a Common National Material Code, and maintains mappings back to the original CPSE material records.

The system combines:

- Natural Language Processing (NLP)
- Sentence embeddings
- Semantic similarity
- Technical attribute extraction
- Hybrid material matching
- Classification
- Functional equivalence checking
- Standardization
- National material code generation
- Human validation
- Audit logging
- Traceability and migration support

The system is designed to operate locally and can process material master data supplied by multiple CPSEs.

---

## 3. Key Features

### AI Material Matching

Identifies relationships between material descriptions using semantic similarity and structured technical attributes.

### Duplicate and Near-Duplicate Detection

Detects materials that are identical or highly similar while considering technical attribute conflicts.

### Functional Equivalence

Evaluates whether materials can be considered functionally equivalent based on their extracted characteristics.

### Intelligent Classification

Classifies materials into categories and subcategories to support material master organization.

### Material Standardization

Generates a normalized material description using extracted technical attributes and standard templates.

### Common National Material Code

Generates a deterministic proposed national material code from standardized material characteristics.

### CPSE Code Mapping

Maintains the relationship between original CPSE material codes and the standardized national material identity.

### Traceability

The original material description and CPSE mapping are retained so that a standardized material can be traced back to its source record.

### Human-in-the-Loop Validation

AI recommendations can be reviewed, approved, or rejected by an authorized user.

### Audit Trail

Approval, rejection, recommendation, and material changes are recorded for governance and traceability.

### Dashboard and Analytics

Provides analytics related to material records, mappings, categories, and harmonization activity.

### Migration Support

Provides APIs and workflows to support material master rationalization and migration activities.

---

## 4. AI Pipeline

```text
Material Description
        ↓
Text Preprocessing
        ↓
Technical Attribute Extraction
        ↓
Semantic Embedding
        ↓
Candidate Search
        ↓
Hybrid Matching
(Semantic Similarity + Attributes)
        ↓
Conflict Detection
        ↓
Classification
        ↓
Standardization
        ↓
Common National Material Code
        ↓
Human Validation
        ↓
Unified Material Master

## 5. Example

Different CPSE descriptions can represent the same material:

CPCL
SS BOLT M10 X 50 MM

IOCL
M10 S.S. HEX BOLT 50MM

HPCL
SS BOLT 10 DIA 50 LG

The AI pipeline identifies these records as an identical group when their
semantic meaning and technical attributes are consistent.

### AI Recommendation

**Match Type:** `IDENTICAL_GROUP`

**Standardized Description:**

`STAINLESS STEEL BOLT DIA 10 mm LENGTH 50 mm`

**Proposed Common National Material Code:**

`FST-BLT-SS-D010-L050`

                    CPSE Material Data
                            ↓
                    Data Ingestion
                            ↓
                    FastAPI Backend
                            ↓
                       AI Engine
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
       NLP Processing              Technical Attributes
              ↓                           ↓
       Semantic Embeddings       Attribute Comparison
              └─────────────┬─────────────┘
                            ↓
                     Hybrid Matching
                            ↓
                    Conflict Detection
                            ↓
                      Classification
                            ↓
                     Standardization
                            ↓
               Common National Code
                            ↓
                    Human Validation
                            ↓
                 Unified Material Master
                            ↓
                 Traceability + Audit

Material Description
        ↓
Text Normalization
        ↓
Technical Attribute Extraction
        ↓
Semantic Embedding
        ↓
Candidate Retrieval
        ↓
Semantic Similarity
        +
Technical Attribute Comparison
        ↓
Conflict Detection
        ↓
Final Match Classification

Material
Type
Grade
Diameter
Length
Width
Thickness
Standard
Bearing Code


SS BOLT M10 X 50 MM
SS BOLT M10 X 60 MM
AI Recommendation
        ↓
Human Review
        ↓
Approve / Reject
        ↓
Standardized Material Master
        ↓
Audit Log

CPSE Material Code
        ↓
Original Description
        ↓
AI Recommendation
        ↓
Standardized Material
        ↓
Common National Material Code

CPSE Material Records
        ↓
Clean and Validate
        ↓
Understand Material
        ↓
AI Recommendation
        ↓
Human Review
        ↓
Standardize Material
        ↓
Generate National Code
        ↓
Map Original CPSE Codes
        ↓
Unified Material Master

---

## 11. Technology Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Python
- FastAPI
- SQLAlchemy

### AI and ML

- Sentence Transformers
- Semantic Embeddings
- FAISS
- Scikit-learn
- NLP Processing

### Data Processing

- Pandas
- NumPy
- OpenPyXL
- SQLite

---

## 12. Project Structure

```text
SIH-26099---Material-Harmonization-and-Standardization/
│
├── SIH - 99/
│   ├── ai_engine/
│   ├── ai_service/
│   ├── database/
│   ├── main.py
│   ├── schemas.py
│   └── ...
│
├── front/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── LICENSE
└── README.md

## 13. Backend API

The FastAPI backend provides APIs for:

- Material management
- CPSE management
- AI recommendations
- Material mapping
- Approval and rejection
- National material records
- Material versioning
- Audit logs
- Analytics
- Search
- Material upload
- Migration export
- ERP synchronization capability

API documentation is available through FastAPI Swagger when the backend server is running:

http://127.0.0.1:8001/docs

---

## 14. Running the Backend

Navigate to the backend directory:

```powershell
cd "SIH - 99"
```

Install the required Python dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
python -m uvicorn main:app --reload --port 8001
```

The backend will be available at:

http://127.0.0.1:8001

Swagger API documentation:

http://127.0.0.1:8001/docs

## 15. Running the Frontend

Navigate to the frontend directory:

```powershell
cd front
```

Install the required packages:

```powershell
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

Vite will provide the local URL for the frontend.

## 16. System Workflow

CPSE Data  
↓  
Data Ingestion  
↓  
Clean and Validate  
↓  
Understand Material  
↓  
AI Recommendation  
↓  
Human Review  
↓  
Standardize Material  
↓  
Generate National Code  
↓  
Map Original CPSE Codes  
↓  
Unified Material Master  
↓  
Audit and Traceability

## 17. Project Impact

- Reduction of duplicate material records
- Improved material master data quality
- Standardized material descriptions
- Better cross-CPSE material visibility
- Material master rationalization
- Traceable migration from legacy material codes
- Improved procurement data consistency
- Better analytics and reporting
- Foundation for one common material identity

- ## 18. Team

Team: CTRLZ1

Smart India Hackathon 2026

Problem Statement: SIH-26099

AI-Driven Standardization and Harmonization of Material Codes Across CPSEs

## 19. License

This project is licensed under the MIT License.
