import argparse
import re
import os
import numpy as np
from openpyxl import load_workbook
import cohere

def preprocess(text, synonym_map, stop_words):
    # lowercase, strip punctuation/numbers/units
    s = str(text).lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\b\d+(?:\.\d+)?\b", " ", s)
    s = re.sub(r"\s+(mm|cm|m|inch|in|ft)\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    # synonyms
    parts = []
    for w in s.split():
        w2 = synonym_map.get(w, w)
        if len(w2) > 3:
            w2 = re.sub(r"(ings|ing|ed|es|s)$", "", w2)
        parts.append(w2)
    # remove stop words
    return " ".join([w for w in parts if w not in stop_words])

SYNONYM_MAP = {
    "bricks": "brick", "brickwork": "brick", "blocks": "brick", "blockwork": "brick",
    "cement": "concrete", "concrete": "concrete",
    "footing": "foundation", "footings": "foundation",
    "excavation": "excavate", "excavations": "excavate", "excavate": "excavate", "dig": "excavate",
    "installation": "install", "installing": "install", "installed": "install",
    "demolition": "demolish", "demolish": "demolish", "demolishing": "demolish", "remove": "demolish",
    "supply": "provide", "supplies": "provide", "providing": "provide",
}

STOP_WORDS = set(
    ["the","and","of","to","in","for","on","at","by","from","with",
     "a","an","be","is","are","as","it","its","into","or"]
)

EMBED_BATCH = 96
EMBED_MODEL = "embed-v4.0"


def embed_texts(client, texts):
    embeddings = []
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i:i+EMBED_BATCH]
        resp = client.embed(
            texts=batch,
            model=EMBED_MODEL,
            input_type="search_query",
            output_dimension=1536,
            embedding_types=["float"]
        )
        embeddings.extend(resp.embeddings.float)
    return np.array(embeddings)


def load_pricelist(path):
    wb = load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    descs, rates = [], []
    for row in ws.iter_rows(min_row=2, values_only=True):
        d, r = row[0], row[1]
        if d and r is not None:
            descs.append(d)
            rates.append(r)
    wb.close()
    return descs, rates


def find_headers(ws):
    # find columns for 'description' and 'qty' or 'quantity'
    header_row = None
    dcol = qcol = None
    for r in range(1,11):
        for c, cell in enumerate(ws[r], start=1):
            val = cell.value
            if isinstance(val, str) and val.lower().strip() == 'description':
                dcol = c
            if isinstance(val, str) and val.lower().strip() in ('qty','quantity'):
                qcol = c
        if dcol and qcol:
            header_row = r
            break
    return header_row, dcol, qcol


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--inquiry', required=True)
    p.add_argument('--pricelist', required=True)
    p.add_argument('--output', required=True)
    p.add_argument('--api-key', required=True)
    args = p.parse_args()

    # init Cohere
    client = cohere.Client(args.api_key)

    # load pricelist data
    raw_descs, rates = load_pricelist(args.pricelist)
    pre_descs = [preprocess(d, SYNONYM_MAP, STOP_WORDS) for d in raw_descs]
    price_embeds = embed_texts(client, pre_descs)
    price_units = price_embeds / np.linalg.norm(price_embeds, axis=1, keepdims=True)

    # open inquiry workbook
    wb = load_workbook(args.inquiry)

    for ws in wb.worksheets:
        hdr, dcol, qcol = find_headers(ws)
        if not hdr:
            continue
        # add columns
        maxc = ws.max_column
        ws.cell(row=hdr, column=maxc+1, value='Matched Rate')
        ws.cell(row=hdr, column=maxc+2, value='Similarity')

        # gather items
        descs = []
        cells = []
        for r in range(hdr+1, ws.max_row+1):
            val = ws.cell(row=r, column=dcol).value
            qty = ws.cell(row=r, column=qcol).value
            if not val or qty is None:
                continue
            descs.append(preprocess(val, SYNONYM_MAP, STOP_WORDS))
            cells.append((r, qty))
        if not descs:
            continue

        # embed inquiry texts
        q_embeds = embed_texts(client, descs)
        q_units = q_embeds / np.linalg.norm(q_embeds, axis=1, keepdims=True)

        # match
        sims = q_units.dot(price_units.T)
        for i, ((row, qty), sim_vec) in enumerate(zip(cells, sims)):
            idx = int(np.argmax(sim_vec))
            best_rate = rates[idx]
            best_score = float(sim_vec[idx])
            ws.cell(row=row, column=maxc+1, value=best_rate * qty)
            ws.cell(row=row, column=maxc+2, value=round(best_score,3))

    # save
    wb.save(args.output)
    print(f"Saved matched results to {args.output}")


if __name__ == '__main__':
    main()
