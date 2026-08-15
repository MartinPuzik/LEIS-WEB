#!/usr/bin/env python3
"""Run LEIS Portable Kernel v3.0.1 local release conformance suites."""

from __future__ import annotations

import json
from pathlib import Path

import leis_hopper_v0_2
import leis_network_security_officer_v1
import leis_policy_profile_v1
import leis_socratic_validator_v1
import leis_transport_v0_3
import leis_universal_hopper_v1


def main() -> int:
    hopper, hopper_ok = leis_hopper_v0_2.self_test()
    transport, transport_ok = leis_transport_v0_3.self_test()
    universal, universal_ok = leis_universal_hopper_v1.self_test()
    policy, policy_ok = leis_policy_profile_v1.self_test()
    socratic = leis_socratic_validator_v1.run_tests()
    network, network_ok = leis_network_security_officer_v1.self_test()
    suites = [
        {"name": "Understanding Hopper v0.2", "passed": hopper_ok, "case_count": hopper["case_count"]},
        {"name": "Transport and Local Retrieval v0.3", "passed": transport_ok, "case_count": transport["case_count"]},
        {"name": "Universal Hopper v1.0", "passed": universal_ok, "case_count": universal["case_count"]},
        {"name": "Policy Profile v1.0", "passed": policy_ok, "case_count": policy["case_count"]},
        {"name": "Socratic compatibility v1.0", "passed": socratic["all_passed"], "case_count": socratic["case_count"]},
        {"name": "Network Security Officer v1.0", "passed": network_ok, "case_count": network["case_count"]},
    ]
    result = {
        "release": "LEIS Portable Kernel v3.0.1",
        "all_passed": all(item["passed"] for item in suites),
        "total_cases": sum(item["case_count"] for item in suites),
        "suites": suites,
        "validated_scope": [
            "Frozen v2.4.0 protocol behavior",
            "Bounded Socratic PATCH compatibility",
            "Loopback-only HTTP boundary and local OFFER resolution",
            "Strict UTF-8 JSON, duplicate-key, size, route, policy, replay, and external-action gates",
            "Metadata-only network audit events",
        ],
        "non_claims": [
            "No public network, remote node, or autonomous command queue was activated.",
            "Conformance does not prove identical internal understanding or universal truth.",
            "Policy gates do not certify legal compliance, privacy, or security.",
            "The suite itself performs no external publication.",
        ],
    }
    output = Path("results/leis-kernel-v3.0.1-release-suite.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=True))
    return 0 if result["all_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
