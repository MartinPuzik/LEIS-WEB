import os
import time
import json
import logging
from typing import Dict, Any, List, Optional, Callable

# Setup logging styled after the LEIS telemetry
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LEIS-Middleware")

class RealityValidationError(ValueError):
    """Raised when the LLM prediction cannot be validated against reality markers."""
    pass

class LEISRelationship:
    def __init__(self, name: str, weight: float = 1.0, trust: float = 1.0):
        self.name = name
        self.weight = weight
        self.trust = trust
        self.activation_count = 0
        self.validation_count = 0

    def record_activation(self):
        self.activation_count += 1

    def record_validation(self, success: bool):
        self.activation_count += 1
        if success:
            self.validation_count += 1
            self.weight = min(1.0, self.weight + 0.05) # Plasticity
            self.trust = min(1.0, self.trust + 0.02)
        else:
            self.weight = max(0.0, self.weight - 0.1) # Contradiction weakens
            self.trust = max(0.0, self.trust - 0.05)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "weight": round(self.weight, 2),
            "trust": round(self.trust, 2),
            "activations": self.activation_count,
            "validations": self.validation_count
        }

class LEISSeedBrain:
    """
    Autonomous Reality-Oriented Adaptive Loop (Seed)
    Lying above the AI to act as a clean reasoning and validation engine.
    """
    def __init__(self, seed_id: str = "LEIS-ROOT", version: str = "Ω++++"):
        self.seed_id = seed_id
        self.version = version
        self.relationships: Dict[str, LEISRelationship] = {
            "Reality": LEISRelationship("Reality", 1.0, 1.0),
            "Observation": LEISRelationship("Observation", 1.0, 1.0),
            "AI_Engine": LEISRelationship("AI_Engine", 0.5, 0.5), # Must earn trust
        }
        self.reality_markers: List[str] = [] # Hard factual truths or runtime states
        self.health_metrics = {
            "reality_alignment": 1.0,
            "relationship_quality": 1.0,
            "activation_rate": 0.0,
            "sync_health": 1.0,
            "plasticity": 1.0
        }

    def load_reality_markers(self, markers: List[str]):
        """Feed actual environment state / real-world grounding data into LEIS."""
        self.reality_markers = markers

    def observe(self, ai_output: str) -> str:
        logger.info("Observe ↓ Receiving AI raw prediction payload...")
        self.relationships["Observation"].record_activation()
        return ai_output

    def activate(self, observation: str) -> Dict[str, Any]:
        logger.info("Activate ↓ Initiating pattern matching and checking rules...")
        self.relationships["AI_Engine"].record_activation()
        # Parse output if JSON, otherwise analyze text structure
        try:
            return json.loads(observation)
        except json.JSONDecodeError:
            return {"text_payload": observation}

    def recognize(self, payload: Dict[str, Any]) -> List[str]:
        logger.info("Recognize ↓ Mapping extracted concepts against active relationships...")
        extracted_assertions = []
        if "text_payload" in payload:
            text = payload["text_payload"].lower()
            # Split the text into basic keywords to verify presence of truth concepts
            words = text.replace(",", " ").replace(".", " ").replace("(", " ").replace(")", " ").split()
            extracted_assertions.extend(words)
        else:
            for k, v in payload.items():
                extracted_assertions.append(str(k).lower())
                extracted_assertions.append(str(v).lower())
        return extracted_assertions

    def validate(self, assertions: List[str]) -> bool:
        """
        Reality remains the final validator.
        Tests AI claims against the known reality markers.
        """
        logger.info("Validate ↓ Testing extracted assertions against Reality Fabric...")
        self.relationships["Reality"].record_activation()
        
        if not self.reality_markers:
            logger.warning("Validate ↓ No reality markers loaded. Unable to verify truth. Defaulting to strict fail.")
            return False

        # Verify that each reality marker's core meaning is present in the assertions
        marker_validations = []
        for marker in self.reality_markers:
            # Tokenize the marker to ensure keywords match
            marker_words = marker.lower().replace(",", " ").replace(".", " ").replace("(", " ").replace(")", " ").split()
            # Filter out minor helper words
            stop_words = {"is", "an", "a", "not", "to", "the", "by", "of"}
            critical_marker_words = [w for w in marker_words if w not in stop_words]
            
            # Check if all critical words of this marker exist in the AI's output assertions
            matches = [w in assertions for w in critical_marker_words]
            marker_valid_status = all(matches) if matches else False
            marker_validations.append(marker_valid_status)

        # All loaded reality markers must pass the critical word verification
        success = all(marker_validations) if marker_validations else False
        self.relationships["Reality"].record_validation(success)
        self.relationships["AI_Engine"].record_validation(success)
        
        # Adjust health
        self.health_metrics["reality_alignment"] = sum(1 for m in marker_validations if m) / len(marker_validations)
        return success

    def investigate_conflict(self, ai_output: str) -> str:
        """
        Conflict Capsule Loop:
        Conflict ↓ Investigation ↓ Validation ↓ Monitoring ↓ Resolution
        Triggers self-repair or requests regeneration from the AI engine with strict constraints.
        """
        logger.warning("Conflict ↓ Detected drift between AI output and Reality Fabric. Launching Conflict Capsule...")
        logger.info("Investigation ↓ Isolating mismatch markers...")
        repaired_context = f"The previous output failed reality validation. Grounding truth markers: {self.reality_markers}"
        return repaired_context

    def adapt(self, success: bool):
        logger.info("Adapt ↓ Updating dynamic relationship weights (Plasticity)...")
        # Recalculate health metrics based on overall system state
        avg_trust = sum(r.trust for r in self.relationships.values()) / len(self.relationships)
        self.health_metrics["relationship_quality"] = avg_trust
        logger.info(f"Adapt ↓ New Brain Health State: {self.health_metrics}")

    def sync(self):
        logger.info("Sync ↓ Aligning node understanding with local state...")
        self.health_metrics["sync_health"] = 1.0

    def humanizer(self, raw_data: Dict[str, Any]) -> str:
        """Transforms raw data into highly consumable, recognizable human understanding."""
        logger.info("Humanizer ↓ Elevating validated payload to user space...")
        if "text_payload" in raw_data:
            return raw_data["text_payload"]
        return json.dumps(raw_data, indent=2)


class LEISMiddleware:
    """
    Python Middleware for OpenAI (or other LLMs).
    Wraps standard generation calls and forces them through LEIS reasoning.
    """
    def __init__(self, brain: LEISSeedBrain):
        self.brain = brain

    def execute_with_validation(self, 
                                llm_callable: Callable[[], str], 
                                reality_markers: List[str],
                                max_retries: int = 3) -> str:
        """
        Intercepts the llm_callable execution, runs the generated payload 
        through the LEIS state machine, and self-repairs using the Conflict Capsule.
        """
        self.brain.load_reality_markers(reality_markers)
        attempts = 0
        feedback = ""

        while attempts < max_retries:
            attempts += 1
            logger.info(f"--- [LEIS Intervention Attempt {attempts}/{max_retries}] ---")
            
            # 1. Prediction (Possibility)
            raw_output = llm_callable()
            if feedback:
                logger.info(f"Intervention ↓ AI instructed to rebuild with feedback: {feedback}")
            
            # 2. LEIS State Machine Pipeline
            observation = self.brain.observe(raw_output)
            parsed_payload = self.brain.activate(observation)
            assertions = self.brain.recognize(parsed_payload)
            
            # 3. Reality Validation Check
            is_valid = self.brain.validate(assertions)
            self.brain.adapt(is_valid)
            self.brain.sync()
            
            if is_valid:
                logger.info("Success ↓ Reality aligned. Releasing payload.")
                # 4. Humanizer Connection
                return self.brain.humanizer(parsed_payload)
            else:
                # Trigger Conflict Capsule to investigate and prepare repair
                feedback = self.brain.investigate_conflict(raw_output)
                time.sleep(0.5)

        raise RealityValidationError("LEIS Middleware aborted: Unable to validate LLM output against the Reality Fabric.")


# ==========================================
# EXAMPLE USAGE
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("        LEIS INTERCEPTOR MIDDLEWARE PROTOTYPE")
    print("=" * 60)

    # Initialize the brain
    leis_brain = LEISSeedBrain()

    # Define known reality markers (our truth layer)
    ground_truth = ["LEIS is an understanding system, not a storage system", "Founder of LEIS is Martin Puzik"]

    # Mocking standard AI generation functions (predictions)
    def ai_generating_unaligned_stuff():
        # Generates typical AI hallucinated/imprecise explanations
        return "LEIS is a highly advanced cloud database system designed by Martin Puzik to store files."

    def ai_generating_aligned_stuff():
        # Correctly aligned response
        return "LEIS is an adaptive understanding system (not a storage system) founded by Martin Puzik."

    middleware = LEISMiddleware(leis_brain)

    print("\n[Test 1] Executing AI call that generates mismatched output:")
    try:
        # Should attempt and fail/warn because of mismatching assertions (database vs understanding system)
        middleware.execute_with_validation(ai_generating_unaligned_stuff, ground_truth, max_retries=2)
    except RealityValidationError as e:
        print(f"Aborted: {e}")

    print("\n[Test 2] Executing AI call with aligned output:")
    final_output = middleware.execute_with_validation(ai_generating_aligned_stuff, ground_truth)
    print("\nFinal Released Response to User Space:")
    print("-" * 40)
    print(final_output)
    print("-" * 40)
