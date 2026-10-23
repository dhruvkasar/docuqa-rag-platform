/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_DOC_ALPHABET = `--- Page 1 ---
ALPHABET INC. ANNOUNCES THIRD QUARTER 2024 RESULTS
MOUNTAIN VIEW, Calif. - October 29, 2024 - Alphabet Inc. (NASDAQ: GOOG, GOOGL) today reported financial results for the quarter ended September 30, 2024.
Consolidated revenues were $88,268 million, an increase of 15% in constant currency and 15% year-over-year compared to $76,693 million in Q3 2023.
Operating income was $28,521 million, an increase of 34% compared to $21,343 million in Q3 2023. Operating margin was 32%, compared to 28% for the third quarter of 2023.
Net income was $26,301 million, up 34% year-over-year from $19,689 million. Diluted EPS was $2.12, compared to $1.55 in Q3 2023.
Sundar Pichai, CEO, said: "Our momentum across the company is extraordinary. Our commitment to innovation, as well as our long-term focus and investment in AI, are paying off as consumers and partners benefit from our AI tools. In Search, our new AI features are expanding what people can search for and how they search."

--- Page 2 ---
ALPHABET SEGMENT RESULTS AND OPERATING HIGHLIGHTS
Google Services:
Total Google Services revenues were $76,510 million in Q3 2024, up 12% from $67,986 million in Q3 2023.
- Google Search & other advertising revenues: $49,385 million, compared to $44,026 million in Q3 2023, reflecting sustained advertiser demand across retail and financial verticals.
- YouTube advertising revenues: $8,921 million, up 12% compared to $7,952 million in Q3 2023, driven by brand advertising and direct response across YouTube Shorts and Connected TV.
- Google Network revenues: $7,548 million, down 2% compared to $7,669 million in Q3 2023.
- Google Subscriptions, platforms, and devices: $10,656 million, up 28% compared to $8,339 million in Q3 2023, propelled by growth in YouTube TV, YouTube Music and Premium subscribers, and Google One subscriptions.
Google Services operating income was $30,853 million, up 29% from $23,945 million in Q3 2023.

--- Page 3 ---
GOOGLE CLOUD AND ARTIFICIAL INTELLIGENCE MOMENTUM
Google Cloud revenues:
Revenues reached $11,353 million in Q3 2024, representing an increase of 35% compared to $8,411 million in the third quarter of 2023.
Growth was led by accelerated adoption of Google Cloud Platform (GCP) across enterprise customers deploying AI infrastructure, Vertex AI enterprise platform, and Google Workspace security enhancements.
Google Cloud operating income was $1,947 million, compared to $266 million in Q3 2023, reflecting dramatic operating leverage and disciplined infrastructure utilization.
Ruth Porat, President and Chief Investment Officer, noted: "Cloud's operating profit of nearly $2 billion demonstrates the inflection point in enterprise cloud adoption and our relentless focus on operational efficiency."

--- Page 4 ---
OTHER BETS, CAPITAL EXPENDITURES, AND CASH FLOW
Other Bets:
Other Bets revenues were $388 million in Q3 2024, compared to $297 million in Q3 2023.
Operating loss for Other Bets was $1,116 million, compared to an operating loss of $1,194 million in Q3 2023.
Waymo continues to expand commercial operations in Phoenix, San Francisco, and Los Angeles, completing over 150,000 paid commercial autonomous trips per week, logging over 1 million fully driverless commercial miles weekly.
Capital Expenditures (CapEx):
Capital expenditures for the third quarter of 2024 were $13,061 million, primarily reflecting investments in technical infrastructure, particularly servers and data centers supporting AI training, inference, and cloud enterprise contracts.
Free Cash Flow:
Operating cash flow for Q3 2024 was $30,698 million. Free cash flow was $17,637 million for the quarter.
Cash, cash equivalents, and marketable securities totaled $93,225 million as of September 30, 2024.

--- Page 5 ---
HEADCOUNT, SHARE REPURCHASES, AND DIVIDENDS
Headcount:
Total Alphabet headcount was 181,268 full-time employees as of September 30, 2024, compared to 182,381 as of September 30, 2023. The minor reduction reflects organizational realignment and ongoing efficiency programs while continuing to recruit world-class engineering and AI research talent.
Share Repurchase Program:
During the third quarter of 2024, Alphabet repurchased and retired $15.3 billion of Class A and Class C shares. In April 2024, the Board of Directors authorized an additional $70 billion in share repurchases.
Cash Dividend:
On October 29, 2024, Alphabet declared a cash dividend of $0.20 per share, payable on December 16, 2024, to stockholders of record as of December 9, 2024. Alphabet intends to pay quarterly cash dividends in the future subject to board review.

--- Page 6 ---
FORWARD GUIDANCE AND 2025 OUTLOOK
Looking ahead to the fourth quarter of 2024 and full-year 2025:
Alphabet anticipates continued capital expenditure investments in AI computing capacity and data center expansions, forecasting Q4 2024 CapEx to remain at approximately $13 billion levels, with further growth projected into 2025.
In Cloud, the focus remains on driving enterprise adoption of Gemini models, enterprise search capabilities, and sovereign cloud capabilities across regulated financial, healthcare, and public sector domains.
Risk factors include macroeconomic fluctuations affecting digital advertising budgets, foreign exchange headwinds, regulatory developments in antitrust and AI governance across North America and the European Union, and escalating competitive dynamics in search and generative AI interfaces.`;

export const DEFAULT_DOC_RAG_WHITEPAPER = `--- Page 1 ---
FRONTIER RAG ARCHITECTURES: CHUNKING, RE-RANKING, AND VERIFIABLE CITATION PROTOCOLS
Technical Whitepaper - Distributed AI Systems Laboratory
Abstract:
Retrieval-Augmented Generation (RAG) is the foundational architecture for grounding Large Language Models (LLMs) on non-public enterprise corpora. However, naive RAG pipelines suffer from significant retrieval failure modes: context fragmentation, semantic dilution, false positive passage matches, and hallucinations. This paper establishes empirical benchmarks comparing Fixed-Size Window Chunking, Recursive Character Splitting, and Semantic Proposition Chunking, paired with Bi-Encoder Dense Retrieval and Cross-Encoder Re-ranking algorithms.

--- Page 2 ---
CHUNKING STRATEGIES AND EMPIRICAL TRADE-OFFS
Document ingestion is the critical initial transformation in any RAG system.
1. Fixed-Size Chunking (512 tokens with 50 token overlap):
Splits text uniformly by token length. While computationally trivial ($O(N)$ execution), it frequently severs sentences, splits tables across chunk boundaries, and generates arbitrary semantic fragments. In our benchmarks, Fixed-Size chunking achieved only 71.4% Retrieval Hit Rate @3.
2. Recursive Character Splitting:
Attempts to preserve document hierarchy by recursively splitting along natural delimiters: paragraph breaks ("\\n\\n"), line breaks ("\\n"), sentence endings (". ", "? ", "! "), and finally whitespace (" "). This yields a marked improvement in context integrity, attaining a 78.6% Hit Rate @3 with an average chunk latency of 850ms.
3. Semantic Proposition Chunking:
Evaluates sentence boundary embeddings and breakpoint cosine distances, splitting only when semantic transition thresholds exceed 0.45. Chunks maintain coherent topical integrity, raising the Retrieval Hit Rate @3 to 86.2% without query expansion.

--- Page 3 ---
DENSE VECTOR RETRIEVAL VS. CROSS-ENCODER RE-RANKING
Dense bi-encoder retrieval independently computes query vectors $E(q)$ and document passage vectors $E(d)$, executing approximate nearest-neighbor search (MIPS) using Cosine Similarity:
$$\\text{Sim}(q, d) = \\frac{E(q) \\cdot E(d)}{\\|E(q)\\| \\|E(d)\\|}$$
While bi-encoders are fast ($<20\\text{ms}$ over 1,000,000 vectors via HNSW indices), they suffer from information bottlenecking because the query and document never interact during embedding generation.
Cross-Encoder Re-Ranking:
To eliminate false positives, modern production RAG incorporates a secondary Re-ranker (e.g. ms-marco-MiniLM-L-6-v2 or Cohere Rerank v3). The Top-10 candidates retrieved by the bi-encoder are fed pairwise into the cross-encoder:
$$\\text{Score}_{\\text{rerank}} = \\text{CrossEncoder}(q, d_i)$$
Re-ranking performs full cross-attention across all tokens of $q$ and $d$, boosting precision and elevating the overall Hit Rate @3 from 86.2% to 91.5%, while adding approximately 330ms of latency per query.

--- Page 4 ---
CITATION GROUNDING AND ANTI-HALLUCINATION ENFORCEMENT
To achieve production reliability in mission-critical applications (legal, financial, medical), the generation phase must enforce strict grounding:
1. Hard Negative System Instructions:
The system prompt mandates: "Answer ONLY from provided context. If the answer is not in context, reply 'This information is not found in the provided documents.' Never extrapolate."
2. In-Token Provenance Tags:
For every factual claim, the model is compelled to generate explicit provenance markers in the standardized format:
[Source: filename, Page X, Chunk Y]
3. Post-Generation Faithfulness Verification:
An automated faithfulness verifier tokenizes each cited assertion, extracts the corresponding source chunk span, and computes token entailment overlap. If the entailment score falls below 0.85, the answer is flagged for human review.

--- Page 5 ---
EVALUATION HARNESS METRICS AND FORMULAS
A production evaluation harness measures four primary quantitative metrics across a curated ground-truth Q/A benchmark dataset:
1. Hit Rate @K (HR@K):
Fraction of benchmark queries where the correct ground-truth source chunk is present in the Top-K retrieved passages:
$$\\text{HitRate}@K = \\frac{1}{N} \\sum_{i=1}^{N} \\mathbb{I}(\\text{source\\_chunk}_i \\in \\text{TopK}_i)$$
2. Mean Reciprocal Rank (MRR):
Evaluates how high the correct source chunk was ranked:
$$\\text{MRR} = \\frac{1}{N} \\sum_{i=1}^{N} \\frac{1}{\\text{Rank}_i}$$
3. Precision @K:
The ratio of truly relevant retrieved documents among the Top-K retrieved candidates.
4. Answer Faithfulness:
Calculated as the percentage of atomic claims in the generated response directly supported by the context snippets. In our testing, Semantic Chunking with Cross-Encoder Re-ranking achieved an MRR of 0.88 and Faithfulness of 94.6%.`;

export const DEFAULT_DOC_UT1_ELECTRONICS = `--- Page 1 ---
UNIT TEST I - BASIC ELECTRICAL AND ELECTRONICS ENGINEERING
Detailed Easy Answers and Revision Guide for Semester Examinations
Topics: Circuit Theorems, Network Analysis, Semiconductor Devices, BJT, FET, and Optoelectronic Components.

--- Page 2 ---
KIRCHHOFF'S LAWS AND NETWORK ANALYSIS
Kirchhoff's Current Law (KCL):
The algebraic sum of all currents entering and leaving any node or junction in an electrical circuit is equal to zero:
\\sum I_{\\text{in}} = \\sum I_{\\text{out}}
Principle: Conservation of electric charge. Current flowing into a junction must equal the current flowing out.
Kirchhoff's Voltage Law (KVL):
The algebraic sum of all branch voltages around any closed loop or mesh in an electrical network is zero:
\\sum V_{\\text{drop}} + \\sum V_{\\text{source}} = 0
Principle: Conservation of energy. The total energy gained per unit charge must balance total energy lost.

--- Page 3 ---
RESISTOR NETWORKS AND STAR-DELTA TRANSFORMATION
Star to Delta Conversion:
To convert a three-terminal Star (Wye) resistive network ($R_A, R_B, R_C$) into an equivalent Delta network ($R_{AB}, R_{BC}, R_{CA}$):
R_{AB} = R_A + R_B + \\frac{R_A R_B}{R_C}
Delta to Star Conversion:
Each branch resistance in the Star network equals the product of adjacent Delta resistances divided by the total sum of Delta resistances:
R_A = \\frac{R_{AB} R_{CA}}{R_{AB} + R_{BC} + R_{CA}}

--- Page 7 ---
THEVENIN'S THEOREM AND EQUIVALENT CIRCUITS
Statement of Thevenin's Theorem:
Any linear two-terminal bilateral electrical network containing independent or dependent voltage and current sources can be replaced by an equivalent circuit consisting of a single voltage source (Thevenin's voltage, $V_{th}$) connected in series with a single resistance (Thevenin's resistance, $R_{th}$).
Procedure for Finding Thevenin Equivalent:
1. Disconnect the load resistor ($R_L$) from terminals A and B.
2. Calculate the open-circuit voltage across terminals A and B: $V_{th} = V_{OC}$.
3. Deactivate all independent sources (short-circuit voltage sources, open-circuit current sources) and determine equivalent resistance looking into terminals A and B: $R_{th} = R_{in}$.
4. The load current is calculated as: $I_L = \\frac{V_{th}}{R_{th} + R_L}$.

--- Page 8 ---
SUPERPOSITION THEOREM AND LINEAR CIRCUITS
Principle of Superposition:
In any linear bilateral circuit having multiple independent sources, the response (voltage or current) across any branch is equal to the algebraic sum of the responses caused by each independent source acting alone, with all other independent sources replaced by their internal impedances (voltage sources shorted, current sources opened).
Limitation: The theorem applies strictly to linear responses (voltage and current), not to non-linear quantities such as power ($P = I^2 R$).

--- Page 11 ---
LIGHT EMITTING DIODE (LED) PRINCIPLES AND CONSTRUCTION
Construction and Working Principle:
A Light Emitting Diode (LED) is a specially fabricated heavily doped PN-junction semiconductor diode. Under forward-bias condition, electrons from the N-region cross the junction and recombine with holes in the P-region. During radiative recombination, excess carrier energy is released directly as photons of light (electroluminescence).
Direct vs. Indirect Bandgap Semiconductors:
Standard silicon and germanium are indirect bandgap materials where recombination produces thermal phonons (heat) rather than photons. LEDs utilize direct bandgap compound semiconductors such as Gallium Arsenide (GaAs, infrared), Gallium Arsenide Phosphide (GaAsP, red/yellow), and Gallium Nitride (GaN, blue/white).

--- Page 12 ---
LED APPLICATIONS, ADVANTAGES, AND DESIGN CONSTRAINTS
Advantages:
High luminous efficiency, instantaneous switching response, compact footprint, and operating lifetimes exceeding 50,000 hours.
Critical Design Challenges:
LEDs have an exponential forward I-V characteristic with low dynamic internal resistance. A dedicated current-limiting series resistor ($R_S = \\frac{V_S - V_F}{I_F}$) or constant-current driver circuit is strictly mandatory to prevent thermal runaway. Adequate thermal heatsinking is essential for high-power luminous applications.

--- Page 13 ---
FIELD EFFECT TRANSISTORS (FET) AND PROTECTION CIRCUITS
Field Effect Transistor (FET) Fundamentals:
A Field Effect Transistor (FET) is a unipolar, voltage-controlled semiconductor device. The current flow between the Drain and Source terminals is regulated by the electric field created by the Gate-to-Source voltage ($V_{GS}$). Because the reverse-biased gate draws virtually zero input current, FETs feature extremely high input impedance ($10^9$ to $10^{12} \\,\\Omega$).
Protection of Inductive Loads:
Switching inductive loads (relays, solenoid coils, motors) with transistors generates large back-EMF voltage spikes ($v = -L \\frac{di}{dt}$) upon turn-off. A flywheel (freewheeling) protection diode placed anti-parallel across the inductor safely clamps and dissipates inductive current, protecting the switching transistor from overvoltage breakdown.

--- Page 14 ---
BIPOLAR JUNCTION TRANSISTOR (BJT) AND SWITCHING REGIONS
Comparison Between BJT and FET:
- BJT: Bipolar device (both electrons and holes conduct); Current-controlled device where base current ($I_B$) controls collector current ($I_C = \\beta I_B$); Low input impedance.
- FET: Unipolar device (majority carriers only); Voltage-controlled device where $V_{GS}$ controls drain current ($I_D$); Extremely high input impedance.
BJT Operating as an Electronic Switch:
A BJT operates as an electronic switch between two states:
1. Cut-off Region (Switch OFF):
Base-Emitter junction is reverse-biased or zero ($V_{BE} \\approx 0\\text{V}, I_B = 0$). Collector current $I_C \\approx 0$. The transistor acts as an open switch with $V_{CE} \\approx V_{CC}$, and the load receives zero current.
2. Saturation Region (Switch ON):
Base-Emitter junction is strongly forward-biased ($I_B \\ge \\frac{I_{C(\\text{sat})}}{\\beta}$). Both BE and BC junctions are forward-biased. The transistor acts as a closed switch with a minimal saturation voltage drop ($V_{CE(\\text{sat})} \\approx 0.2\\text{V}$). The load is fully energized. A base resistor ($R_B$) is required to limit base current.
Common Emitter (CE) Input and Output Characteristics:
- Input Characteristics: Plot of base current $I_B$ against base-emitter voltage $V_{BE}$ for constant $V_{CE}$. Exhibits standard forward PN-junction diode threshold (approx 0.7V for silicon).
- Output Characteristics: Plot of collector current $I_C$ against $V_{CE}$ for constant values of $I_B$, showing cut-off, active linear, and saturation operational regions.`;
