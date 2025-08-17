# these file is not for running purpose thesse file is used for datste generattion



# JEE Mains Percentile dataset generation


import pandas as pd
import numpy as np
import math

# --- 1. CONFIGURATION PARAMETERS ---
YEARS = [2025, 2024, 2023]
SESSIONS = ['January', 'April']
SHIFTS = range(1, 11)  # Generates shifts 1, 2, ..., 10
MARKS_RANGE = range(-20, 301, 1) # Practical marks range

# The range from which a random difficulty factor will be chosen for each shift.
# < 1.0 means an easier shift (same marks = lower percentile).
# > 1.0 means a tougher shift (same marks = higher percentile).
DIFFICULTY_RANGE = (0.92, 1.08)

# Parameters to control the shape of the S-curve (sigmoid function) for percentile mapping.
# MID_POINT: The mark at which the percentile is roughly 50.
# SPREAD: Controls how steeply the percentile rises. A smaller number means a steeper curve.
SIGMOID_MID_POINT = 95.0
SIGMOID_SPREAD = 45.0

OUTPUT_FILENAME = 'jee_mains_percentile_data.csv'


# --- 2. CORE LOGIC ---

def calculate_percentile_from_marks(marks, mid_point, spread):
    """
    Calculates a percentile from 0-100 using a logistic (sigmoid) function.
    This creates a realistic S-shaped curve for the baseline.
    """
    # Scale and shift the marks to fit the sensitive range of the sigmoid function
    scaled_marks = (marks - mid_point) / spread
    
    # The logistic function formula, scaled to 100
    percentile = 100 * (1 / (1 + math.exp(-scaled_marks)))
    
    return percentile


# --- 3. MAIN DATA GENERATION SCRIPT ---

print("Starting JEE Mains Percentile dataset generation...")

all_records = []

# Loop through each year, session, and shift
for year in YEARS:
    print(f"-> Generating data for Year: {year}...")
    for session in SESSIONS:
        for shift in SHIFTS:
            
            # Generate a single, unique difficulty factor for this entire shift
            difficulty_factor = np.random.uniform(DIFFICULTY_RANGE[0], DIFFICULTY_RANGE[1])
            
            # Now, loop through every possible mark for this specific shift
            for marks in MARKS_RANGE:
                
                # Adjust the marks based on the shift's difficulty.
                # A tougher shift (factor > 1) effectively increases the student's score's value.
                adjusted_marks = marks * difficulty_factor
                
                # Calculate the final percentile using the adjusted marks
                expected_percentile = calculate_percentile_from_marks(
                    adjusted_marks, 
                    SIGMOID_MID_POINT, 
                    SIGMOID_SPREAD
                )
                
                # Ensure percentile doesn't exceed 100 (and add tiny randomness)
                final_percentile = min(expected_percentile + np.random.uniform(-0.005, 0.005), 99.9999)
                final_percentile = max(0, final_percentile) # Ensure it doesn't go below 0

                record = {
                    'YEAR': year,
                    'SESSION': session,
                    'SHIFT': shift,
                    'MARKS_SCORED': marks,
                    'DIFFICULTY_FACTOR': round(difficulty_factor, 4),
                    'EXPECTED_PERCENTILE': round(final_percentile, 4)
                }
                all_records.append(record)

print("\nDataset generation complete.")

# --- 4. CREATE DATAFRAME AND SAVE ---

df = pd.DataFrame(all_records)
df.to_csv(OUTPUT_FILENAME, index=False)

print(f"\nSuccessfully generated {len(df)} records.")
print(f"Dataset saved to '{OUTPUT_FILENAME}'.")


# --- 5. DISPLAY SAMPLE DATA FOR VERIFICATION ---
print("\n--- Sample of Generated Data ---")
print("Notice how for the same marks (e.g., 150), a higher difficulty factor results in a higher percentile.")
print(df[df['MARKS_SCORED'] == 150].head(10))


import pandas as pd
import numpy as np
import math

# --- 1. GLOBAL CONFIGURATION ---
YEARS = [2025, 2024, 2023]
CATEGORIES = ['GENERAL', 'EWS', 'OBC-NCL', 'SC', 'ST']
GENDERS = ['M', 'F']
PWD_STATUSES = ['No', 'Yes'] # <-- NEW: Added PwD for both generators

# --- NEW: Define deltas for creating rank ranges ---
GENERAL_RANK_DELTA = 150  # e.g., A rank of 10000 becomes a range of 9850-10150
CATEGORY_RANK_DELTA = 50 # e.g., A rank of 2500 becomes a range of 2450-2550

# --- Divisors and Modifiers ---
CATEGORY_DIVISORS = {'GENERAL': 1.0, 'EWS': 3.5, 'OBC-NCL': 4.0, 'SC': 9.0, 'ST': 15.0}
GENDER_MODIFIER = 0.95 
PWD_DIVISOR = 20.0 

# ==============================================================================
# SECTION 1: JEE MAINS DATASET GENERATION
# ==============================================================================

# --- MAINS CONFIG ---
MAINS_MARKS_RANGE = range(-20, 301, 1)
MAINS_YEAR_PARAMS = {
    2025: {'A': 1260000, 'B': 0.0295},
    2024: {'A': 1415000, 'B': 0.0310},
    2023: {'A': 1113000, 'B': 0.0285}
}
MAINS_TOPPER_PARAMS = {'START_MARKS': 290, 'END_MARKS': 300, 'START_RANK': 200, 'END_RANK': 1}

def calculate_mains_ranks(year, marks, category, pwd_status):
    """Calculates Mains ranks and returns them as ranges."""
    params = MAINS_YEAR_PARAMS[year]
    A, B = params['A'], params['B']
    
    general_rank_center = 0
    if marks >= MAINS_TOPPER_PARAMS['START_MARKS']:
        m_start, m_end = MAINS_TOPPER_PARAMS['START_MARKS'], MAINS_TOPPER_PARAMS['END_MARKS']
        r_start, r_end = MAINS_TOPPER_PARAMS['START_RANK'], MAINS_TOPPER_PARAMS['END_RANK']
        marks_fraction = (marks - m_start) / (m_end - m_start)
        general_rank_center = r_start + marks_fraction * (r_end - r_start)
    else:
        general_rank_center = A * math.exp(-B * marks)

    # --- NEW: Create a range for General Rank ---
    general_rank_min = max(1, int(general_rank_center - GENERAL_RANK_DELTA))
    general_rank_max = max(1, int(general_rank_center + GENERAL_RANK_DELTA))

    # Calculate the center of the category rank
    category_rank_center = general_rank_center / CATEGORY_DIVISORS[category]
    
    # --- NEW: Apply PwD divisor if applicable ---
    if pwd_status == 'Yes':
        category_rank_center /= PWD_DIVISOR

    # --- NEW: Create a range for Category Rank ---
    category_rank_min = max(1, int(category_rank_center - CATEGORY_RANK_DELTA))
    category_rank_max = max(1, int(category_rank_center + CATEGORY_RANK_DELTA))
    
    return general_rank_min, general_rank_max, category_rank_min, category_rank_max


def generate_mains_dataset():
    """Main function to generate the entire JEE Mains dataset."""
    print("Generating JEE Mains dataset with PwD status and rank ranges...")
    all_records = []
    for year in YEARS:
        print(f"-> Mains Year: {year}")
        for marks in MAINS_MARKS_RANGE:
            for category in CATEGORIES:
                for gender in GENDERS:
                    # --- NEW: Loop for PwD status ---
                    for pwd_status in PWD_STATUSES:
                        gen_min, gen_max, cat_min, cat_max = calculate_mains_ranks(year, marks, category, pwd_status)
                        
                        # Apply gender benefit to the final category rank range
                        final_cat_min, final_cat_max = cat_min, cat_max
                        if gender == 'F':
                            final_cat_min = max(1, int(final_cat_min * GENDER_MODIFIER))
                            final_cat_max = max(1, int(final_cat_max * GENDER_MODIFIER))
                        
                        record = {
                            'YEAR': year,
                            'MARKS_SCORED': marks,
                            'CATEGORY': category,
                            'GENDER': gender,
                            'PWD_STATUS': pwd_status, # <-- NEW COLUMN
                            'EXPECTED_GENERAL_RANK_MIN': gen_min,
                            'EXPECTED_GENERAL_RANK_MAX': gen_max,
                            'EXPECTED_CATEGORY_RANK_MIN': final_cat_min,
                            'EXPECTED_CATEGORY_RANK_MAX': final_cat_max,
                        }
                        all_records.append(record)

    df = pd.DataFrame(all_records)
    filename = 'jee_mains_rank_data_v5_final.csv'
    df.to_csv(filename, index=False)
    print(f"\nSuccessfully generated {len(df)} records for JEE Mains.")
    print(f"Saved to '{filename}'.")
    return df

# ==============================================================================
# SECTION 2: JEE ADVANCED DATASET GENERATION
# ==============================================================================

# --- ADVANCED CONFIG ---
ADV_YEAR_STATS = {
    2025: {'appeared': 180422, 'topper_score': 332, 'qualifying_marks': {'GENERAL': 74, 'EWS': 66, 'OBC-NCL': 66, 'SC': 37, 'ST': 37}},
    2024: {'appeared': 180200, 'topper_score': 355, 'qualifying_marks': {'GENERAL': 109, 'EWS': 98, 'OBC-NCL': 98, 'SC': 54, 'ST': 54}},
    2023: {'appeared': 180372, 'topper_score': 341, 'qualifying_marks': {'GENERAL': 86, 'EWS': 77, 'OBC-NCL': 77, 'SC': 43, 'ST': 43}}
}
min_cutoff = min(min(stats['qualifying_marks'].values()) for stats in ADV_YEAR_STATS.values())
ADV_MARKS_RANGE = range(max(0, min_cutoff - 20), 361, 1)


def calculate_advanced_ranks(year, marks, category, pwd_status):
    """Calculates Advanced ranks and returns them as ranges."""
    stats = ADV_YEAR_STATS[year]
    if marks < stats['qualifying_marks'][category]:
        return 0, 0, 0, 0 # Not Qualified

    general_rank_center = 0
    topper_score = stats['topper_score']
    appeared = stats['appeared']
    topper_zone_start = topper_score - 40 

    if marks >= topper_zone_start:
        r_start = appeared * math.exp(-0.025 * topper_zone_start)
        marks_fraction = (marks - topper_zone_start) / (topper_score - topper_zone_start)
        general_rank_center = r_start + marks_fraction * (1 - r_start)
    else:
        general_rank_center = appeared * math.exp(-0.025 * marks)

    # --- NEW: Create a range for General Rank ---
    general_rank_min = max(1, int(general_rank_center - GENERAL_RANK_DELTA))
    general_rank_max = max(1, int(general_rank_center + GENERAL_RANK_DELTA))
    
    category_rank_center = general_rank_center / CATEGORY_DIVISORS[category]
    if pwd_status == 'Yes':
        category_rank_center /= PWD_DIVISOR
    
    # --- NEW: Create a range for Category Rank ---
    category_rank_min = max(1, int(category_rank_center - CATEGORY_RANK_DELTA))
    category_rank_max = max(1, int(category_rank_center + CATEGORY_RANK_DELTA))

    return general_rank_min, general_rank_max, category_rank_min, category_rank_max

def generate_advanced_dataset():
    """Main function to generate the entire JEE Advanced dataset."""
    print("\nGenerating JEE Advanced dataset with rank ranges...")
    all_records = []
    for year in YEARS:
        print(f"-> Advanced Year: {year}")
        for marks in ADV_MARKS_RANGE:
            for category in CATEGORIES:
                for gender in GENDERS:
                    for pwd_status in PWD_STATUSES:
                        gen_min, gen_max, cat_min, cat_max = calculate_advanced_ranks(year, marks, category, pwd_status)
                        
                        final_cat_min, final_cat_max = cat_min, cat_max
                        if gender == 'F' and gen_min > 0: # Only apply benefit if qualified
                            final_cat_min = max(1, int(final_cat_min * GENDER_MODIFIER))
                            final_cat_max = max(1, int(final_cat_max * GENDER_MODIFIER))
                        
                        record = {
                            'YEAR': year,
                            'MARKS_SCORED': marks,
                            'CATEGORY': category,
                            'GENDER': gender,
                            'PWD_STATUS': pwd_status,
                            'EXPECTED_GENERAL_RANK_MIN': gen_min,
                            'EXPECTED_GENERAL_RANK_MAX': gen_max,
                            'EXPECTED_CATEGORY_RANK_MIN': final_cat_min,
                            'EXPECTED_CATEGORY_RANK_MAX': final_cat_max,
                        }
                        all_records.append(record)

    df = pd.DataFrame(all_records)
    filename = 'jee_advanced_rank_data_v2_final.csv'
    df.to_csv(filename, index=False)
    print(f"\nSuccessfully generated {len(df)} records for JEE Advanced.")
    print(f"Saved to '{filename}'.")
    return df

# ==============================================================================
# SECTION 3: EXECUTION
# ==============================================================================
if __name__ == "__main__":
    generate_mains_dataset()
    generate_advanced_dataset()
    print("\nAll datasets generated successfully.")
    
    

# what i have did is 
# npm init -y
# npm install express mysql2 dotenv cors
# npm install -D nodemon
# npm run dev