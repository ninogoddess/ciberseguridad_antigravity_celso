const fs = require('fs');
const path = require('path');

function verifyLinks() {
    const report = {
        phase: "Phase 2: Link",
        status: "INCOMPLETE",
        checks: {}
    };

    // 1. Check Branding MD
    const brandingPath = path.join(process.cwd(), 'branding', 'branding.md');
    if (fs.existsSync(brandingPath)) {
        const content = fs.readFileSync(brandingPath, 'utf8');
        const hasColors = content.includes('Colors');
        const hasFonts = content.includes('Fonts');
        report.checks.branding_md = {
            exists: true,
            valid_format: hasColors && hasFonts
        };
    } else {
        report.checks.branding_md = { exists: false };
    }

    // 2. Check Image
    const imagePath = path.join(process.cwd(), 'branding', 'image.png');
    if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        report.checks.branding_image = {
            exists: true,
            size_bytes: stats.size,
            valid: stats.size > 0
        };
    } else {
        report.checks.branding_image = { exists: false };
    }

    // 3. Check Environment
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    report.checks.environment = {
        node_modules_exists: fs.existsSync(nodeModulesPath)
    };

    // Final Status
    const allPassed = 
        report.checks.branding_md.valid_format && 
        report.checks.branding_image.valid && 
        report.checks.environment.node_modules_exists;

    report.status = allPassed ? "PASSED" : "FAILED";

    // Save to .tmp
    if (!fs.existsSync('.tmp')) fs.mkdirSync('.tmp');
    fs.writeFileSync('.tmp/link_status.json', JSON.stringify(report, null, 2));

    return report;
}

const result = verifyLinks();
console.log(JSON.stringify(result, null, 2));
if (result.status === "FAILED") process.exit(1);
