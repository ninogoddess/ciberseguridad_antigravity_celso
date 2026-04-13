import os
import json
from pathlib import Path

def verify_links():
    report = {
        "phase": "Phase 2: Link",
        "status": "INCOMPLETE",
        "checks": {}
    }
    
    # 1. Check Branding File
    branding_path = Path("branding/branding.md")
    if branding_path.exists():
        content = branding_path.read_text(encoding='utf-8')
        has_colors = "Colors" in content
        has_fonts = "Fonts" in content
        report["checks"]["branding_md"] = {
            "exists": True,
            "valid_format": has_colors and has_fonts
        }
    else:
        report["checks"]["branding_md"] = {"exists": False}

    # 2. Check Branding Image
    image_path = Path("branding/image.png")
    if image_path.exists():
        size = image_path.stat().st_size
        report["checks"]["branding_image"] = {
            "exists": True,
            "size_bytes": size,
            "valid": size > 0
        }
    else:
        report["checks"]["branding_image"] = {"exists": False}

    # 3. Check Environment (node_modules)
    node_modules_path = Path("node_modules")
    report["checks"]["environment"] = {
        "node_modules_exists": node_modules_path.exists()
    }

    # Final Status
    all_passed = all([
        report["checks"]["branding_md"].get("valid_format"),
        report["checks"]["branding_image"].get("valid"),
        report["checks"]["environment"].get("node_modules_exists")
    ])
    
    report["status"] = "PASSED" if all_passed else "FAILED"
    
    # Save to .tmp
    os.makedirs(".tmp", exist_ok=True)
    with open(".tmp/link_status.json", "w") as f:
        json.dump(report, f, indent=2)
        
    return report

if __name__ == "__main__":
    result = verify_links()
    print(json.dumps(result, indent=2))
