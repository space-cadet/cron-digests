#!/bin/bash
# Reformat existing digests to uniform format v2.0
# Usage: ./reformat-digest.sh <input.md> <output.md> <type>
# type: arxiv | web-science

INPUT="$1"
OUTPUT="$2"
TYPE="$3"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ] || [ -z "$TYPE" ]; then
    echo "Usage: $0 <input.md> <output.md> <arxiv|web-science>"
    exit 1
fi

# Extract date from filename or content
DATE=$(basename "$INPUT" .md)

# Create temp file
TMP=$(mktemp)

# Write header
echo "# $(echo $TYPE | sed 's/-/&/;s/^./\u&/') Digest — $DATE" > "$TMP"
echo "" >> "$TMP"

# Extract and count items
if [ "$TYPE" = "arxiv" ]; then
    # Extract categories
    CATS=$(grep -m1 "Categories:" "$INPUT" | sed 's/.*Categories:\s*//' | sed 's/\*\*//g')
    echo "**Categories:** ${CATS:-hep-th, gr-qc, quant-ph}" >> "$TMP"
else
    # Extract sites
    SITES=$(grep -m1 "Sites:" "$INPUT" | sed 's/.*Sites:\s*//' | sed 's/\*\*//g')
    echo "**Sites:** ${SITES:-Phys.org + ScienceDaily}" >> "$TMP"
fi

# Count entries (## N. or ### N.)
COUNT=$(grep -cE "^(##|###) [0-9]+\." "$INPUT")
echo "**Items found:** $COUNT" >> "$TMP"

# Extract focus/topics from existing or generate default
FOCUS=$(grep -m1 "Focus:" "$INPUT" | sed 's/.*Focus:\s*//' | sed 's/\*\*//g')
if [ -z "$FOCUS" ]; then
    # Extract keywords from titles
    FOCUS="various topics"
fi
echo "**Focus:** $FOCUS" >> "$TMP"
echo "" >> "$TMP"

# Extract entries and reformat
# Handle both ## N. and ### N. formats
awk '
BEGIN { entry_num = 0; in_entry = 0; buffer = "" }
/^## [0-9]+\./ || /^### [0-9]+\./ {
    if (in_entry && buffer != "") {
        print buffer
        print "---"
        print ""
    }
    in_entry = 1
    entry_num++
    # Normalize to ## N.
    sub(/^### /, "## ")
    buffer = $0
    next
}
in_entry {
    # Skip old section headers (## without number)
    if (/^## [^0-9]/) {
        # Section header — skip but keep entry going
        next
    }
    buffer = buffer "\n" $0
}
END {
    if (in_entry && buffer != "") {
        print buffer
    }
}
' "$INPUT" >> "$TMP"

# Clean up: remove trailing separator
sed -i '/^---$/{$!{N;/^---\n$/d}}' "$TMP"

# Move to output
mv "$TMP" "$OUTPUT"
echo "Reformatted: $INPUT → $OUTPUT ($COUNT items)"
