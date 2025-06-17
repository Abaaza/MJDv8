import argparse
import re
import os
import sys
import json
import logging
from datetime import datetime
from typing import List, Tuple, Dict, Optional
import numpy as np
from openpyxl import load_workbook, Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import cohere

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('price_matching.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# Enhanced preprocessing with better synonym mapping and stop words
SYNONYM_MAP = {
    # Building materials
    "bricks": "brick", "brickwork": "brick", "blocks": "brick", "blockwork": "brick",
    "masonry": "brick", "stonework": "stone", "tiles": "tile", "tiling": "tile",
    
    # Concrete and cement
    "cement": "concrete", "concrete": "concrete", "mortar": "concrete",
    "grout": "concrete", "screed": "concrete", "render": "concrete",
    
    # Foundation work
    "footing": "foundation", "footings": "foundation", "foundations": "foundation",
    "basement": "foundation", "substructure": "foundation",
    
    # Excavation and earthwork
    "excavation": "excavate", "excavations": "excavate", "excavate": "excavate", 
    "dig": "excavate", "digging": "excavate", "earthwork": "excavate",
    "trenching": "excavate", "grading": "excavate",
    
    # Installation and construction
    "installation": "install", "installing": "install", "installed": "install",
    "construction": "build", "building": "build", "erection": "install",
    "assembly": "install", "fitting": "install",
    
    # Demolition and removal
    "demolition": "demolish", "demolish": "demolish", "demolishing": "demolish", 
    "remove": "demolish", "removal": "demolish", "strip": "demolish",
    "break": "demolish", "dismantle": "demolish",
    
    # Supply and provision
    "supply": "provide", "supplies": "provide", "providing": "provide",
    "furnish": "provide", "deliver": "provide", "procurement": "provide",
    
    # Finishes
    "painting": "paint", "plastering": "plaster", "flooring": "floor",
    "roofing": "roof", "cladding": "clad", "insulation": "insulate",
    
    # MEP (Mechanical, Electrical, Plumbing)
    "electrical": "electric", "plumbing": "plumb", "hvac": "ventilation",
    "heating": "heat", "cooling": "cool", "ventilation": "ventilate",
    
    # Structural
    "reinforcement": "reinforce", "steelwork": "steel", "formwork": "form",
    "shuttering": "shutter", "framework": "frame"
}

STOP_WORDS = {
    "the", "and", "of", "to", "in", "for", "on", "at", "by", "from", "with",
    "a", "an", "be", "is", "are", "as", "it", "its", "into", "or", "this",
    "that", "will", "shall", "would", "could", "should", "may", "might",
    "per", "each", "all", "any", "some", "no", "not", "only", "such",
    "than", "too", "very", "can", "had", "her", "was", "one", "our", "out",
    "day", "get", "has", "him", "his", "how", "man", "new", "now", "old",
    "see", "two", "way", "who", "boy", "did", "use", "she", "they", "we"
}

# Enhanced configuration
EMBED_BATCH = 90  # Slightly reduced for stability
EMBED_MODEL = "embed-v4.0"
OUTPUT_DIMENSION = 1536
SIMILARITY_THRESHOLD = 0.3  # Minimum similarity score to consider a match
MAX_RETRIES = 3
RETRY_DELAY = 1.0

class ProgressTracker:
    """Track and report progress during processing"""
    
    def __init__(self, total_steps: int = 100):
        self.total_steps = total_steps
        self.current_step = 0
        self.start_time = datetime.now()
    
    def update(self, step: int, message: str = ""):
        self.current_step = step
        percentage = (step / self.total_steps) * 100
        elapsed = datetime.now() - self.start_time
        
        progress_msg = f"Progress: {percentage:.1f}% ({step}/{self.total_steps})"
        if message:
            progress_msg += f" - {message}"
        
        logger.info(progress_msg)
        print(f"PROGRESS: {percentage:.1f}%", flush=True)
    
    def complete(self, message: str = "Processing completed"):
        elapsed = datetime.now() - self.start_time
        logger.info(f"{message} in {elapsed.total_seconds():.2f} seconds")

def enhanced_preprocess(text: str, synonym_map: Dict[str, str], stop_words: set) -> str:
    """Enhanced text preprocessing with better normalization"""
    if not text or text is None or (hasattr(text, '__len__') and len(str(text).strip()) == 0):
        return ""
    
    # Convert to string and lowercase
    s = str(text).lower().strip()
    
    # Remove special characters but preserve spaces and alphanumeric
    s = re.sub(r"[^\w\s]", " ", s)
    
    # Normalize units and measurements
    s = re.sub(r"\b\d+(?:\.\d+)?\s*(mm|cm|m|inch|in|ft|feet|yard|yd)\b", " UNIT ", s)
    
    # Normalize numbers
    s = re.sub(r"\b\d+(?:\.\d+)?\b", " NUM ", s)
    
    # Remove extra whitespace
    s = re.sub(r"\s+", " ", s).strip()
    
    # Apply synonyms and stemming
    words = []
    for word in s.split():
        # Apply synonym mapping
        word = synonym_map.get(word, word)
        
        # Simple stemming for common suffixes
        if len(word) > 4:
            word = re.sub(r"(ings|ing|ed|es|s|tion|sion)$", "", word)
        
        # Filter out stop words and very short words
        if word not in stop_words and len(word) > 2:
            words.append(word)
    
    return " ".join(words)

def embed_texts_with_retry(client: cohere.Client, texts: List[str], input_type: str = "search_document") -> np.ndarray:
    """Embed texts with retry logic and better error handling"""
    embeddings = []
    
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i:i+EMBED_BATCH]
        batch_num = (i // EMBED_BATCH) + 1
        total_batches = (len(texts) + EMBED_BATCH - 1) // EMBED_BATCH
        
        logger.info(f"Processing embedding batch {batch_num}/{total_batches} ({len(batch)} items)")
        
        for attempt in range(MAX_RETRIES):
            try:
                resp = client.embed(
                    texts=batch,
                    model=EMBED_MODEL,
                    input_type=input_type,
                    embedding_types=["float"]
                )
                
                # Debug: Log response structure
                logger.debug(f"API response type: {type(resp)}")
                logger.debug(f"API response has embeddings: {hasattr(resp, 'embeddings')}")
                
                # Extract embeddings with proper validation for Cohere v4.0
                if hasattr(resp, 'embeddings') and resp.embeddings:
                    # For Cohere v4.0, embeddings is an EmbedByTypeResponseEmbeddings object
                    batch_embeddings_raw = resp.embeddings
                    logger.debug(f"Batch embeddings type: {type(batch_embeddings_raw)}")
                    
                    # Try to access the float embeddings
                    embeddings_list = []
                    
                    # Method 1: Try to access 'float' attribute (Cohere v4.0)
                    float_embeddings = getattr(batch_embeddings_raw, 'float', None)
                    if float_embeddings is not None:
                        logger.debug(f"Found float embeddings (v4.0 format)")
                        logger.debug(f"Float embeddings type: {type(float_embeddings)}")
                        logger.debug(f"Float embeddings length: {len(float_embeddings)}")
                        
                        # Each embedding should be a list of floats
                        for emb in float_embeddings:
                            if isinstance(emb, list) and len(emb) > 100:  # Validate dimension
                                embeddings_list.append(emb)
                            else:
                                logger.warning(f"Invalid embedding format: {type(emb)}, length: {len(emb) if hasattr(emb, '__len__') else 'No length'}")
                    
                    # Method 2: Try direct iteration (older formats or direct list)
                    elif isinstance(batch_embeddings_raw, list):
                        logger.debug(f"Found direct list of embeddings (older format)")
                        for emb in batch_embeddings_raw:
                            if isinstance(emb, list) and len(emb) > 100:
                                embeddings_list.append(emb)
                            else:
                                logger.warning(f"Invalid direct embedding: {type(emb)}, length: {len(emb) if hasattr(emb, '__len__') else 'No length'}")
                    
                    # Method 3: Try iterating and checking attributes
                    elif hasattr(batch_embeddings_raw, '__iter__'):
                        logger.debug(f"Trying attribute-based extraction")
                        for emb in batch_embeddings_raw:
                            if isinstance(emb, list) and len(emb) > 100:
                                embeddings_list.append(emb)
                            else:
                                # Try different attribute names
                                emb_float = getattr(emb, 'float', None)
                                values = getattr(emb, 'values', None)
                                embedding = getattr(emb, 'embedding', None)
                                
                                if emb_float is not None and isinstance(emb_float, list) and len(emb_float) > 100:
                                    embeddings_list.append(emb_float)
                                elif values is not None and hasattr(values, '__iter__') and len(list(values)) > 100:
                                    embeddings_list.append(list(values))
                                elif embedding is not None and hasattr(embedding, '__iter__') and len(list(embedding)) > 100:
                                    embeddings_list.append(list(embedding))
                                else:
                                    logger.warning(f"Could not extract valid embedding from: {type(emb)}")
                                    continue
                    
                    if not embeddings_list:
                        logger.error(f"No valid embeddings extracted from batch")
                        logger.error(f"Raw embeddings type: {type(batch_embeddings_raw)}")
                        logger.error(f"Raw embeddings dir: {dir(batch_embeddings_raw)}")
                        if hasattr(batch_embeddings_raw, '__len__'):
                            logger.error(f"Raw embeddings length: {len(batch_embeddings_raw)}")
                        raise ValueError(f"No valid embeddings extracted from batch. Raw type: {type(batch_embeddings_raw)}")
                    
                    logger.debug(f"Extracted {len(embeddings_list)} embeddings from batch")
                    if embeddings_list:
                        logger.debug(f"First embedding length: {len(embeddings_list[0])}")
                        logger.debug(f"Expected embedding dimension: {OUTPUT_DIMENSION}")
                    
                    # Validate all embeddings have same dimension
                    first_dim = len(embeddings_list[0])
                    for idx, emb in enumerate(embeddings_list):
                        if len(emb) != first_dim:
                            logger.error(f"Inconsistent embedding dimensions: embedding {idx} has {len(emb)}, expected {first_dim}")
                            raise ValueError(f"Inconsistent embedding dimensions in batch")
                    
                    embeddings.extend(embeddings_list)
                    
                else:
                    raise ValueError("No embeddings found in API response")
                
                break
                
            except Exception as e:
                logger.warning(f"Embedding attempt {attempt + 1} failed: {str(e)}")
                if attempt == MAX_RETRIES - 1:
                    raise Exception(f"Failed to get embeddings after {MAX_RETRIES} attempts: {str(e)}")
                
                import time
                time.sleep(RETRY_DELAY * (attempt + 1))
    
    # Convert to numpy array and validate final shape
    try:
        logger.info(f"Total embeddings collected: {len(embeddings)}")
        if embeddings:
            logger.info(f"First embedding sample length: {len(embeddings[0])}")
            logger.info(f"Last embedding sample length: {len(embeddings[-1])}")
            
            # Check for consistency in embedding dimensions
            embedding_lengths = [len(emb) for emb in embeddings[:5]]  # Check first 5
            logger.info(f"First 5 embedding lengths: {embedding_lengths}")
            
            # Validate all embeddings have consistent dimensions
            if len(set(embedding_lengths)) > 1:
                raise ValueError(f"Inconsistent embedding dimensions: {embedding_lengths}")
        
        embeddings_array = np.array(embeddings, dtype=np.float32)
        logger.info(f"Created embeddings array with shape: {embeddings_array.shape}")
        
        # Ensure we have a 2D array with proper dimensions
        if len(embeddings_array.shape) != 2:
            raise ValueError(f"Expected 2D embeddings array, got shape {embeddings_array.shape}")
        
        # Validate embedding dimension (should be 1024+ for embed-v4.0)
        if embeddings_array.shape[1] < 100:  # Reasonable minimum dimension check
            raise ValueError(f"Embedding dimension too small: {embeddings_array.shape[1]}, expected ~1024")
        
        return embeddings_array
        
    except Exception as e:
        logger.error(f"Failed to create embeddings array: {str(e)}")
        logger.error(f"Embeddings list length: {len(embeddings)}")
        if embeddings:
            logger.error(f"First embedding type: {type(embeddings[0])}")
            logger.error(f"First embedding length: {len(embeddings[0]) if hasattr(embeddings[0], '__len__') else 'No length'}")
            if hasattr(embeddings[0], '__len__') and len(embeddings[0]) > 5:
                logger.error(f"First embedding sample: {embeddings[0][:5]}")
            else:
                logger.error(f"First embedding: {embeddings[0]}")
        raise ValueError(f"Failed to create valid embeddings array: {str(e)}")

def load_pricelist_enhanced(path: str) -> Tuple[List[str], List[float], List[str]]:
    """Load pricelist with enhanced validation and metadata"""
    logger.info(f"Loading pricelist from: {path}")
    
    try:
        wb = load_workbook(path, read_only=True, data_only=True)
        ws = wb.active
        
        if ws is None:
            raise ValueError("No active worksheet found in pricelist file")
        
        descriptions = []
        rates = []
        units = []
        
        # Find header row
        header_row = 1
        for row in range(1, min(6, ws.max_row + 1)):
            for cell in ws[row]:
                if cell.value and 'description' in str(cell.value).lower():
                    header_row = row
                    break
        
        logger.info(f"Found header row at: {header_row}")
        
        # Process data rows
        valid_items = 0
        for row_num, row in enumerate(ws.iter_rows(min_row=header_row + 1, values_only=True), start=header_row + 1):
            if len(row) < 2:
                continue
                
            desc = row[0]
            rate = row[1]
            unit = row[2] if len(row) > 2 else "each"
            
            # Validate data
            if desc and rate is not None:
                try:
                    # Handle different cell value types
                    if isinstance(rate, (int, float)):
                        rate_float = float(rate)
                    elif isinstance(rate, str):
                        rate_float = float(rate)
                    else:
                        # Skip non-numeric values
                        logger.warning(f"Non-numeric rate at row {row_num}: {rate}")
                        continue
                        
                    if rate_float > 0:  # Only positive rates
                        descriptions.append(str(desc).strip())
                        rates.append(rate_float)
                        units.append(str(unit) if unit else "each")
                        valid_items += 1
                except (ValueError, TypeError):
                    logger.warning(f"Invalid rate at row {row_num}: {rate}")
                    continue
        
        wb.close()
        logger.info(f"Loaded {valid_items} valid price items from pricelist")
        
        if valid_items == 0:
            raise ValueError("No valid price items found in pricelist")
        
        return descriptions, rates, units
        
    except Exception as e:
        logger.error(f"Error loading pricelist: {str(e)}")
        raise

def find_headers_enhanced(ws) -> Tuple[Optional[int], Optional[int], Optional[int]]:
    """Enhanced header detection with fuzzy matching"""
    header_row = None
    desc_col = None
    qty_col = None
    
    # Search in first 10 rows for headers
    for row_num in range(1, min(11, ws.max_row + 1)):
        row = ws[row_num]
        
        for col_num, cell in enumerate(row, start=1):
            if not cell.value:
                continue
                
            cell_value = str(cell.value).lower().strip()
            
            # Description column patterns
            if any(pattern in cell_value for pattern in ['description', 'desc', 'item', 'work']):
                desc_col = col_num
                header_row = row_num
                logger.info(f"Found description column {col_num} at row {row_num}: '{cell.value}'")
            
            # Quantity column patterns
            if any(pattern in cell_value for pattern in ['qty', 'quantity', 'amount', 'no']):
                qty_col = col_num
                logger.info(f"Found quantity column {col_num} at row {row_num}: '{cell.value}'")
        
        # If we found description column, we can proceed
        if desc_col:
            break
    
    return header_row, desc_col, qty_col

def add_result_columns_with_formatting(ws, header_row: int, max_col: int):
    """Add result columns with proper formatting"""
    # Define new column headers
    new_headers = ['Matched Description', 'Matched Rate', 'Total Amount', 'Similarity Score', 'Match Quality']
    
    # Add headers with formatting
    for i, header in enumerate(new_headers, start=1):
        col_num = max_col + i
        cell = ws.cell(row=header_row, column=col_num, value=header)
        
        # Apply header formatting
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin")
        )
        
        # Set column width
        ws.column_dimensions[get_column_letter(col_num)].width = 20
    
    return len(new_headers)

def calculate_match_quality(similarity: float) -> str:
    """Determine match quality based on similarity score"""
    if similarity >= 0.9:
        return "Excellent"
    elif similarity >= 0.8:
        return "Very Good"
    elif similarity >= 0.7:
        return "Good"
    elif similarity >= 0.6:
        return "Fair"
    elif similarity >= 0.5:
        return "Poor"
    else:
        return "Very Poor"

def main():
    parser = argparse.ArgumentParser(description="Enhanced Cohere Excel Price Matching")
    parser.add_argument('--inquiry', required=True, help='Path to inquiry Excel file')
    parser.add_argument('--pricelist', required=True, help='Path to pricelist Excel file')
    parser.add_argument('--output', required=True, help='Path for output Excel file')
    parser.add_argument('--api-key', required=True, help='Cohere API key')
    parser.add_argument('--similarity-threshold', type=float, default=SIMILARITY_THRESHOLD, 
                       help='Minimum similarity threshold for matches')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize progress tracker
    progress = ProgressTracker(100)
    
    try:
        logger.info("=== Enhanced Cohere Excel Price Matching Started ===")
        logger.info(f"Inquiry file: {args.inquiry}")
        logger.info(f"Pricelist file: {args.pricelist}")
        logger.info(f"Output file: {args.output}")
        logger.info(f"Similarity threshold: {args.similarity_threshold}")
        
        # Initialize Cohere client
        progress.update(5, "Initializing Cohere client")
        try:
            client = cohere.Client(args.api_key)
            logger.info("Cohere client initialized successfully")
        except Exception as e:
            raise Exception(f"Failed to initialize Cohere client: {str(e)}")
        
        # Load and process pricelist
        progress.update(10, "Loading pricelist")
        price_descriptions, price_rates, price_units = load_pricelist_enhanced(args.pricelist)
        
        progress.update(15, "Preprocessing pricelist descriptions")
        processed_price_descs = [enhanced_preprocess(desc, SYNONYM_MAP, STOP_WORDS) 
                               for desc in price_descriptions]
        
        # Generate price embeddings
        progress.update(20, "Generating price embeddings")
        price_embeddings = embed_texts_with_retry(client, processed_price_descs, "search_document")
        price_embeddings_norm = price_embeddings / np.linalg.norm(price_embeddings, axis=1, keepdims=True)
        
        # Load inquiry workbook
        progress.update(40, "Loading inquiry workbook")
        try:
            wb = load_workbook(args.inquiry)
            logger.info(f"Loaded workbook with {len(wb.worksheets)} worksheets")
        except Exception as e:
            raise Exception(f"Failed to load inquiry file: {str(e)}")
        
        total_processed = 0
        total_matched = 0
        
        # Process each worksheet
        for sheet_idx, ws in enumerate(wb.worksheets):
            sheet_progress_start = 45 + (sheet_idx * 45 // len(wb.worksheets))
            progress.update(sheet_progress_start, f"Processing sheet: {ws.title}")
            
            logger.info(f"Processing worksheet: {ws.title}")
            
            # Find headers
            header_row, desc_col, qty_col = find_headers_enhanced(ws)
            if not header_row or not desc_col:
                logger.warning(f"Could not find required columns in sheet {ws.title}")
                continue
            
            # Add result columns
            max_col = ws.max_column
            num_new_cols = add_result_columns_with_formatting(ws, header_row, max_col)
            
            # Collect items for processing
            inquiry_items = []
            item_rows = []
            
            for row_num in range(header_row + 1, ws.max_row + 1):
                desc_cell = ws.cell(row=row_num, column=desc_col)
                qty_cell = ws.cell(row=row_num, column=qty_col) if qty_col else None
                
                if not desc_cell.value:
                    continue
                
                description = str(desc_cell.value).strip()
                quantity = 1.0
                
                if qty_cell and qty_cell.value:
                    try:
                        # Handle different cell value types
                        if isinstance(qty_cell.value, (int, float)):
                            quantity = float(qty_cell.value)
                        elif isinstance(qty_cell.value, str):
                            quantity = float(qty_cell.value)
                        else:
                            quantity = 1.0
                    except (ValueError, TypeError):
                        quantity = 1.0
                
                # Filter out non-item rows
                if len(description) < 5 or description.lower() in ['description', 'item', 'work']:
                    continue
                
                inquiry_items.append({
                    'description': description,
                    'quantity': quantity,
                    'row': row_num
                })
                item_rows.append(row_num)
            
            if not inquiry_items:
                logger.warning(f"No valid items found in sheet {ws.title}")
                continue
            
            logger.info(f"Found {len(inquiry_items)} items to process in sheet {ws.title}")
            print(f"PROGRESS_INFO: Found {len(inquiry_items)} items to match in sheet '{ws.title}'")
            
            # Process inquiry descriptions
            progress.update(sheet_progress_start + 5, f"Preprocessing {len(inquiry_items)} inquiry items")
            processed_inquiry_descs = [enhanced_preprocess(item['description'], SYNONYM_MAP, STOP_WORDS) 
                                     for item in inquiry_items]
            
            # Generate inquiry embeddings
            progress.update(sheet_progress_start + 10, f"Generating embeddings for {len(inquiry_items)} inquiry items")
            inquiry_embeddings = embed_texts_with_retry(client, processed_inquiry_descs, "search_query")
            
            # Validate embedding shapes
            logger.info(f"Inquiry embeddings shape: {inquiry_embeddings.shape}")
            logger.info(f"Price embeddings shape: {price_embeddings.shape}")
            
            # Ensure embeddings are 2D arrays
            if len(inquiry_embeddings.shape) != 2:
                logger.error(f"Inquiry embeddings have wrong shape: {inquiry_embeddings.shape}")
                raise ValueError(f"Expected 2D array for inquiry embeddings, got shape {inquiry_embeddings.shape}")
            
            if len(price_embeddings.shape) != 2:
                logger.error(f"Price embeddings have wrong shape: {price_embeddings.shape}")
                raise ValueError(f"Expected 2D array for price embeddings, got shape {price_embeddings.shape}")
            
            # Check if embedding dimensions match
            if inquiry_embeddings.shape[1] != price_embeddings.shape[1]:
                logger.error(f"Embedding dimension mismatch: inquiry={inquiry_embeddings.shape[1]}, price={price_embeddings.shape[1]}")
                raise ValueError(f"Embedding dimensions don't match: {inquiry_embeddings.shape[1]} vs {price_embeddings.shape[1]}")
            
            # Normalize embeddings
            progress.update(sheet_progress_start + 15, "Normalizing embeddings and calculating similarities")
            inquiry_embeddings_norm = inquiry_embeddings / np.linalg.norm(inquiry_embeddings, axis=1, keepdims=True)
            
            # Calculate similarities
            logger.info(f"Calculating similarity matrix: {inquiry_embeddings_norm.shape} x {price_embeddings_norm.shape}")
            similarities = inquiry_embeddings_norm.dot(price_embeddings_norm.T)
            logger.info(f"Similarity matrix calculated with shape: {similarities.shape}")
            
            # Process matches
            progress.update(sheet_progress_start + 20, f"Processing matches for {len(inquiry_items)} items")
            sheet_matched = 0
            for i, item in enumerate(inquiry_items):
                sim_scores = similarities[i]
                best_idx = np.argmax(sim_scores)
                best_score = sim_scores[best_idx]
                
                row_num = item['row']
                
                if best_score >= args.similarity_threshold:
                    # Good match found
                    matched_desc = price_descriptions[best_idx]
                    matched_rate = price_rates[best_idx]
                    matched_unit = price_units[best_idx]
                    total_amount = item['quantity'] * matched_rate
                    quality = calculate_match_quality(best_score)
                    
                    # Fill result columns
                    ws.cell(row=row_num, column=max_col + 1, value=matched_desc)
                    ws.cell(row=row_num, column=max_col + 2, value=matched_rate)
                    ws.cell(row=row_num, column=max_col + 3, value=total_amount)
                    ws.cell(row=row_num, column=max_col + 4, value=round(best_score, 3))
                    ws.cell(row=row_num, column=max_col + 5, value=quality)
                    
                    # Apply conditional formatting based on quality
                    quality_cell = ws.cell(row=row_num, column=max_col + 5)
                    if best_score >= 0.8:
                        quality_cell.fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
                    elif best_score >= 0.6:
                        quality_cell.fill = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
                    else:
                        quality_cell.fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
                    
                    sheet_matched += 1
                else:
                    # No good match found
                    ws.cell(row=row_num, column=max_col + 1, value="No suitable match found")
                    ws.cell(row=row_num, column=max_col + 4, value=round(best_score, 3))
                    ws.cell(row=row_num, column=max_col + 5, value="No Match")
                    
                    # Mark as no match
                    quality_cell = ws.cell(row=row_num, column=max_col + 5)
                    quality_cell.fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
            
            total_processed += len(inquiry_items)
            total_matched += sheet_matched
            
            logger.info(f"Sheet {ws.title}: {sheet_matched}/{len(inquiry_items)} items matched")
            print(f"PROGRESS_INFO: Sheet '{ws.title}' completed: {sheet_matched}/{len(inquiry_items)} items matched")
            
            # Update progress for this sheet completion
            sheet_progress_end = 45 + ((sheet_idx + 1) * 45 // len(wb.worksheets))
            progress.update(sheet_progress_end, f"Completed sheet {ws.title}: {sheet_matched}/{len(inquiry_items)} matched")
        
        # Save results
        progress.update(95, "Saving results")
        try:
            wb.save(args.output)
            logger.info(f"Results saved to: {args.output}")
        except Exception as e:
            raise Exception(f"Failed to save output file: {str(e)}")
        
        # Final summary
        progress.update(100, "Processing completed")
        match_rate = (total_matched / total_processed * 100) if total_processed > 0 else 0
        
        summary = {
            "total_processed": total_processed,
            "total_matched": total_matched,
            "match_rate": round(match_rate, 2),
            "output_file": args.output
        }
        
        logger.info("=== Processing Summary ===")
        logger.info(f"Total items processed: {total_processed}")
        logger.info(f"Total items matched: {total_matched}")
        logger.info(f"Match rate: {match_rate:.2f}%")
        logger.info(f"Output saved to: {args.output}")
        
        # Output JSON summary for Node.js backend
        print(f"SUMMARY: {json.dumps(summary)}")
        
        progress.complete("Enhanced price matching completed successfully")
        
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
