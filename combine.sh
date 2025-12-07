# #!/bin/bash

# # Output file path for the snapshot
# OUTPUT_FILE="project_snapshot.txt"

# # ----------------------------------------------------
# # Define Exclusion Patterns
# # ----------------------------------------------------

# # Directories to explicitly ignore in the tree structure and content search
# IGNORE_DIRS_PATTERN="node_modules|dist"

# # Files/extensions to explicitly ignore globally (using escaped dots for grep)
# IGNORE_FILES_PATTERN="\
# \.DS_Store|\
# \.gitignore|\
# package-lock\.json|\
# yarn\.lock|\
# \.log$|\
# \.webp$|\
# \.jpg$|\
# \.jpeg$|\
# \.png$|\
# \.svg$|\
# \.sh$|\
# copy\.txt$|\
# project_snapshot\.txt$"

# # --- Cleanup and Header ---
# echo "// ===============================================" > "$OUTPUT_FILE"
# echo "// === SMART CAREER PREDICTOR PROJECT SNAPSHOT ===" >> "$OUTPUT_FILE"
# echo "// === Generated: $(date) ===" >> "$OUTPUT_FILE"
# echo "// ===============================================" >> "$OUTPUT_FILE"


# # --- 1. Print Directory Structure ---
# echo "" >> "$OUTPUT_FILE"
# echo "// ----------------------------------------------------" >> "$OUTPUT_FILE"
# echo "// ----- DIRECTORY STRUCTURE START (FutureRank Directory) -----" >> "$OUTPUT_FILE"
# echo "// ----------------------------------------------------" >> "$OUTPUT_FILE"

# # Use 'tree' to generate the structure, excluding specified directories.
# tree -a -F -I "$IGNORE_DIRS_PATTERN" --noreport 2>/dev/null | grep -v -E "$IGNORE_FILES_PATTERN" >> "$OUTPUT_FILE"

# # Add a separator
# echo "// ----- DIRECTORY STRUCTURE END -----" >> "$OUTPUT_FILE"
# echo "" >> "$OUTPUT_FILE"


# # --- 2. Print File Contents ---

# echo "// ----- FILE CONTENTS START (Source Code & Config) -----" >> "$OUTPUT_FILE"

# # Use 'find' to locate all source files and print content:
# # Use -not -name to ensure minimal file size and exclude binaries
# find . -type f \
#     -not -path "*/node_modules/*" \
#     -not -path "*/dist/*" \
#     -not -name "package-lock.json" \
#     -not -name "yarn.lock" \
#     -not -name "*.log" \
#     -not -name ".DS_Store" \
#     -not -name ".gitignore" \
#     -not -name "*.webp" \
#     -not -name "*.jpg" \
#     -not -name "*.jpeg" \
#     -not -name "*.png" \
#     -not -name "*.svg" \
#     -not -name "*.sh" \
#     -not -name "$OUTPUT_FILE" \
#     -print0 | \
#     while IFS= read -r -d $'\0' file; do

#         # Print file header with clear relative path and content
#         echo "" >> "$OUTPUT_FILE"
#         echo "// ==========================================================" >> "$OUTPUT_FILE"
#         echo "// === START FILE: ${file#./} ===" >> "$OUTPUT_FILE"
#         echo "// ==========================================================" >> "$OUTPUT_FILE"
#         cat "$file" >> "$OUTPUT_FILE"
#         echo "// ==========================================================" >> "$OUTPUT_FILE"
#         echo "// === END FILE: ${file#./} ===" >> "$OUTPUT_FILE"
#         echo "// ==========================================================" >> "$OUTPUT_FILE"
#     done

# echo "" >> "$OUTPUT_FILE"
# echo "// ----- PROJECT SNAPSHOT END -----" >> "$OUTPUT_FILE"

# echo "✅ Project snapshot saved to $OUTPUT_FILE"


#!/bin/bash

# Output file ka naam
OUTPUT_FILE="project_snapshot.txt"

# --- 1. Header aur Tree Structure ---
echo "=======================================================" > "$OUTPUT_FILE"
echo "PROJECT DIRECTORY STRUCTURE" >> "$OUTPUT_FILE"
echo "=======================================================" >> "$OUTPUT_FILE"

# Tree command jo .git, node_modules, dist aur images ko ignore karega
if command -v tree &> /dev/null; then
    tree -a -I '.git|node_modules|dist|*.png|*.jpg|*.jpeg|*.webp|*.svg|*.ico|package-lock.json|yarn.lock' --noreport >> "$OUTPUT_FILE"
else
    echo "Error: 'tree' command not found. Skipping directory tree." >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "=======================================================" >> "$OUTPUT_FILE"
echo "FILE CONTENTS START" >> "$OUTPUT_FILE"
echo "=======================================================" >> "$OUTPUT_FILE"


# --- 2. File Contents with Full Path ---

# Find command jo files dhundega par bekaar folders/files ko chhod dega
find . -type f \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -name 'package-lock.json' \
    -not -name 'yarn.lock' \
    -not -name '.DS_Store' \
    -not -name '*.png' \
    -not -name '*.jpg' \
    -not -name '*.jpeg' \
    -not -name '*.webp' \
    -not -name '*.svg' \
    -not -name '*.ico' \
    -not -name '*.log' \
    -not -name "$OUTPUT_FILE" \
    -not -name "generate_snapshot.sh" \
    -not -name "copy.txt" \
    -print0 | while IFS= read -r -d '' file; do

    # Har file ke liye header aur uska content
    echo "" >> "$OUTPUT_FILE"
    echo "#######################################################" >> "$OUTPUT_FILE"
    echo "FULL PATH: $file" >> "$OUTPUT_FILE"
    echo "#######################################################" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

done

echo "" >> "$OUTPUT_FILE"
echo "=======================================================" >> "$OUTPUT_FILE"
echo "END OF PROJECT SNAPSHOT" >> "$OUTPUT_FILE"
echo "=======================================================" >> "$OUTPUT_FILE"

echo "✅ Clean snapshot saved to $OUTPUT_FILE"