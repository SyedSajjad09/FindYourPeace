"""
Dataset Validation Script
Validates the integrity and authenticity of the Quran verses dataset
"""

import json
from pathlib import Path
from datetime import datetime

def validate_dataset():
    """Validate the dataset.json file"""
    
    print("🔍 Starting Dataset Validation...\n")
    
    dataset_path = Path(__file__).parent / "dataset.json"
    
    if not dataset_path.exists():
        print("❌ Error: dataset.json not found!")
        return False
    
    try:
        with open(dataset_path, "r", encoding="utf-8") as f:
            dataset = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON - {e}")
        return False
    
    # Validate metadata
    print("📋 Validating Metadata...")
    metadata = dataset.get("metadata", {})
    required_metadata = ["version", "last_updated", "total_conditions", "total_verses", "translation"]
    
    for field in required_metadata:
        if field not in metadata:
            print(f"  ❌ Missing metadata field: {field}")
            return False
        else:
            print(f"  ✅ {field}: {metadata[field]}")
    
    print()
    
    # Validate conditions
    print("🎭 Validating Conditions...")
    conditions = dataset.get("conditions", [])
    
    if len(conditions) != metadata["total_conditions"]:
        print(f"  ❌ Condition count mismatch: {len(conditions)} vs {metadata['total_conditions']}")
        return False
    
    total_verses_found = 0
    required_fields = ["id", "label", "description", "tags", "ui_theme", "verses"]
    verse_fields = ["ayah_text", "surah_name", "surah_number", "ayah_number", "source_url", "verified_at"]
    
    for idx, condition in enumerate(conditions, 1):
        print(f"\n  {idx}. {condition.get('label', 'UNKNOWN')}")
        
        # Check required fields
        for field in required_fields:
            if field not in condition:
                print(f"    ❌ Missing field: {field}")
                return False
        
        # Validate verses
        verses = condition.get("verses", [])
        total_verses_found += len(verses)
        
        if len(verses) != 10:
            print(f"    ⚠️  Warning: Expected 10 verses, found {len(verses)}")
        else:
            print(f"    ✅ Has 10 verses")
        
        # Validate each verse
        for v_idx, verse in enumerate(verses, 1):
            for v_field in verse_fields:
                if v_field not in verse:
                    print(f"      ❌ Verse {v_idx} missing field: {v_field}")
                    return False
            
            # Validate source URL format
            expected_url = f"https://quran.com/{verse['surah_number']}/{verse['ayah_number']}"
            if verse['source_url'] != expected_url:
                print(f"      ⚠️  Warning: Verse {v_idx} URL mismatch")
                print(f"         Expected: {expected_url}")
                print(f"         Found: {verse['source_url']}")
        
        print(f"    ✅ All verse fields present")
    
    print(f"\n📊 Total verses validated: {total_verses_found}")
    
    if total_verses_found != metadata["total_verses"]:
        print(f"  ⚠️  Warning: Metadata says {metadata['total_verses']}, found {total_verses_found}")
    
    # Validate UI themes
    print("\n🎨 Validating UI Themes...")
    theme_fields = ["primary_color", "secondary_color", "gradient", "ambient_sound"]
    
    for condition in conditions:
        theme = condition.get("ui_theme", {})
        for field in theme_fields:
            if field not in theme:
                print(f"  ❌ {condition['label']} missing theme field: {field}")
                return False
    
    print("  ✅ All themes valid")
    
    # Summary
    print("\n" + "="*60)
    print("✅ VALIDATION SUCCESSFUL!")
    print("="*60)
    print(f"  Total Conditions: {len(conditions)}")
    print(f"  Total Verses: {total_verses_found}")
    print(f"  Translation: {metadata['translation']}")
    print(f"  Last Updated: {metadata['last_updated']}")
    print(f"  Verification Source: {metadata['verification_source']}")
    print("="*60)
    
    return True

if __name__ == "__main__":
    success = validate_dataset()
    exit(0 if success else 1)
