import csv

file_path = r"C:\Users\Harshit\Downloads\Archive\fullerton.screenrecord.csv"

MAX_COL_WIDTH = 20  # truncate long values

def truncate(value, width=MAX_COL_WIDTH):
    value = str(value)
    return value if len(value) <= width else value[:width-3] + "..."

# Read header + first 10 rows
rows = []
with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    for i, row in enumerate(reader):
        if i >= 10:
            break
        rows.append(row)

# Print column names
print("Columns:")
for idx, col in enumerate(headers, 1):
    print(f"{idx}. {col}")

print("\nFirst 10 Rows (truncated for readability):")
for i, row in enumerate(rows, 1):
    print(f"\nRow {i}:")
    for col_name, cell in zip(headers, row):
        print(f"{col_name}: {truncate(cell)}")
