#!/usr/bin/env python3
"""
LEIS Reconstruction Fidelity Index (RFI) Calculator
Version: 1.0
Author: Gemini Notebook / LEIS Protocol Design

This script programmatically calculates the Reconstruction Fidelity Index (RFI)
between an Original Source and a reconstructed Current Interpretation. It uses
a structured JSON checklist representing the core semantic coordinates (Context,
Intent, Relationship, Question) and scans the target reconstruction text for
the presence of verified keyword patterns.
"""

import sys
import os
import json
import argparse

# Default evaluation checklist for the German Sunlight Entanglement paper
DEFAULT_CHECKLIST = {
    "context": [
        {
            "id": "C01",
            "item": "Collector area of 1.4 square meters",
            "weight": 1.0,
            "keywords": ["1.4", "quadratmeter", "square meter"]
        },
        {
            "id": "C02",
            "item": "94% entanglement fidelity",
            "weight": 1.0,
            "keywords": ["94", "fidelity", "fidelität"]
        },
        {
            "id": "C03",
            "item": "Robert Boyd & University of Ottawa",
            "weight": 1.0,
            "keywords": ["boyd", "ottawa"]
        },
        {
            "id": "C04",
            "item": "Max Planck Institute for Science of Light",
            "weight": 1.0,
            "keywords": ["max planck", "erlangen"]
        },
        {
            "id": "C05",
            "item": "Glass cone solar concentrator & crystal",
            "weight": 1.0,
            "keywords": ["cone", "kegelförmig", "concentrator", "konzentrator", "crystal", "kristall"]
        }
    ],
    "intent": [
        {
            "id": "I01",
            "item": "Widerlegt/Disprove basic assumption that lasers are mandatory",
            "weight": 1.0,
            "keywords": ["laser", "widerlegt", "disprove", "dogma", "assumption", "annahme"]
        },
        {
            "id": "I02",
            "item": "Spontaneous parametric down-conversion (splitting photons)",
            "weight": 1.0,
            "keywords": ["parametric", "down-conversion", "fluoreszenz", "aufspaltet", "daughter", "tochter"]
        },
        {
            "id": "I03",
            "item": "Energy-efficient quantum technologies (where every watt counts)",
            "weight": 1.0,
            "keywords": ["energy", "watt", "effizient", "low power"]
        }
    ],
    "relationship": [
        {
            "id": "R01",
            "item": "Instantaneous entanglement link independent of distance",
            "weight": 1.0,
            "keywords": ["entangled", "verschränkt", "instantaneous", "distance", "entfernung"]
        },
        {
            "id": "R02",
            "item": "Violation of Bell's Inequality",
            "weight": 1.0,
            "keywords": ["bell", "ungleichung", "inequality"]
        },
        {
            "id": "R03",
            "item": "Lineage link to prior LED incoherent light research",
            "weight": 1.0,
            "keywords": ["led", "leuchtdioden", "incoherent", "inkohärent"]
        }
    ],
    "question": [
        {
            "id": "Q01",
            "item": "Tap-proof / secure satellite communications",
            "weight": 1.0,
            "keywords": ["space", "weltraum", "satellite", "satelliten", "crypto", "abhörsicher"]
        },
        {
            "id": "Q02",
            "item": "Nonlinear optics follow-up experiments",
            "weight": 1.0,
            "keywords": ["nonlinear", "optics", "optik"]
        }
    ]
}

def analyze_text(text, checklist):
    """
    Scans the target text (case-insensitive) for the presence of keywords
    defined in each checklist item. Returns a detailed report of matches and scores.
    """
    text_lower = text.lower()
    report = {
        "categories": {},
        "summary": {
            "total_weight": 0.0,
            "matched_weight": 0.0,
            "rfi": 0.0
        }
    }
    
    total_rfi_sum = 0.0
    num_categories = 0
    
    for category, items in checklist.items():
        cat_total_weight = 0.0
        cat_matched_weight = 0.0
        cat_results = []
        
        for item in items:
            cat_total_weight += item["weight"]
            # Check if any keyword matches
            matched = False
            matching_keyword = None
            for kw in item["keywords"]:
                if kw.lower() in text_lower:
                    matched = True
                    matching_keyword = kw
                    break
            
            if matched:
                cat_matched_weight += item["weight"]
                status = "PRESERVED"
            else:
                status = "LOST"
                
            cat_results.append({
                "id": item["id"],
                "item": item["item"],
                "status": status,
                "matched_keyword": matching_keyword,
                "weight": item["weight"]
            })
            
        cat_percentage = (cat_matched_weight / cat_total_weight * 100) if cat_total_weight > 0 else 0.0
        total_rfi_sum += cat_percentage
        num_categories += 1
        
        report["categories"][category] = {
            "score_percent": cat_percentage,
            "items": cat_results,
            "total_weight": cat_total_weight,
            "matched_weight": cat_matched_weight
        }
        
        report["summary"]["total_weight"] += cat_total_weight
        report["summary"]["matched_weight"] += cat_matched_weight

    # Calculate overall RFI (average of the category percentages, keeping categories equally weighted)
    report["summary"]["rfi"] = total_rfi_sum / num_categories if num_categories > 0 else 0.0
    return report

def generate_ascii_bar(percent, width=30):
    """Generates an ASCII loading-bar style visualization."""
    filled = int(round(percent / 100.0 * width))
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {percent:.1f}%"

def print_text_report(report):
    """Prints a beautiful, clean CLI report of the RFI results."""
    print("=" * 80)
    print("                      LEIS RECONSTRUCTION FIDELITY AUDIT")
    print("=" * 80)
    print()
    
    rfi = report["summary"]["rfi"]
    print(f"  RECONSTRUCTION FIDELITY INDEX (RFI): {generate_ascii_bar(rfi, 40)}")
    print()
    print("-" * 80)
    print("  CATEGORY BREAKDOWNS")
    print("-" * 80)
    
    for cat, details in report["categories"].items():
        name = cat.upper()
        score = details["score_percent"]
        print(f"  • {name:<15}: {generate_ascii_bar(score, 25)}")
        
    print()
    print("-" * 80)
    print("  DETAILED SEMANTIC ELEMENT AUDIT")
    print("-" * 80)
    
    for cat, details in report["categories"].items():
        print(f"\n  [{cat.upper()}] (Score: {details['score_percent']:.1f}%)")
        for item in details["items"]:
            icon = "✓" if item["status"] == "PRESERVED" else "✗"
            color_prefix = "\033[92m" if item["status"] == "PRESERVED" else "\033[91m"
            color_suffix = "\033[0m"
            
            # If colors are not supported or redirected, standard text:
            keyword_info = f" (matched: '{item['matched_keyword']}')" if item["matched_keyword"] else ""
            print(f"    {icon} [{item['id']}] {item['item']}{keyword_info}")
            
    print("\n" + "=" * 80)
    print("  Audit completed based on LEIS Grounding Rules.")
    print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="LEIS Reconstruction Fidelity Index (RFI) Calculator")
    parser.add_argument("--text-file", help="Path to the reconstructed text file to analyze.")
    parser.add_argument("--checklist-file", help="Path to a custom JSON checklist file.")
    parser.add_argument("--raw-text", help="Raw text string to analyze directly.")
    
    args = parser.parse_args()
    
    # Load checklist
    if args.checklist_file:
        try:
            with open(args.checklist_file, 'r', encoding='utf-8') as f:
                checklist = json.load(f)
        except Exception as e:
            print(f"Error loading checklist file: {e}")
            sys.exit(1)
    else:
        checklist = DEFAULT_CHECKLIST
        
    # Get target text
    text = ""
    if args.text_file:
        try:
            with open(args.text_file, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading text file: {e}")
            sys.exit(1)
    elif args.raw_text:
        text = args.raw_text
    else:
        # If no arguments provided, run on a default simulated translation
        # of the sunlight experiment that contains some gaps (modeling our previous turn)
        print("No target text provided. Running a self-test with a simulated interpretation...\n")
        text = """
        The German sunlight quantum entanglement breakthrough was achieved by researchers at the 
        Max Planck Institute for the Science of Light in Erlangen and the University of Ottawa led by 
        Robert Boyd. They utilized a custom cone-shaped glass solar concentrator focused on a 
        millimeter-thin nonlinear crystal under the open sky to generate entangled photon pairs with 
        nearly 94 percent fidelity, violating the Bell inequality.
        
        This disproved the decades-old dogma in quantum optics that only expensive, high-power lasers 
        could generate coherent quantum states. Sunlight itself was historically viewed as highly 
        incoherent, chaotic, and divergent, but this passive setup proved that it can be concentrated 
        to produce stable quantum states. This is a massive milestone for low-power space satellites 
        where every watt of energy counts.
        
        However, the previous interpretation omitted the structural linkage to the group's prior 
        seminal research generating entangled states using incoherent LEDs, which served as the actual 
        conceptual stepping stone. It also failed to detail the specific physical splitting mechanism of 
        spontaneous parametric down-conversion inside the crystal, and didn't mention the follow-up 
        implications for future nonlinear optics experiments.
        """
        
    report = analyze_text(text, checklist)
    print_text_report(report)

if __name__ == "__main__":
    main()
