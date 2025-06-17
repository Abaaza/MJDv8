import argparse
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).resolve().parents[1]))
from server.services.coherepricematcher import (
    load_pricelist_from_db,
    load_inquiry_data,
    fill_inquiry_rates,
    EMBEDDING_MODEL,
)
import cohere


def main():
    parser = argparse.ArgumentParser(
        description="Parse Excel, match prices via Cohere, and populate the sheet"
    )
    parser.add_argument("input", help="Path to input Excel file")
    parser.add_argument("output", help="Path for output Excel file")
    parser.add_argument("--api-key", required=True, dest="api_key", help="Cohere API key")
    args = parser.parse_args()

    def log(msg: str) -> None:
        print(msg)

    client = cohere.ClientV2(api_key=args.api_key)

    price_descs, price_rates = load_pricelist_from_db(log)
    wb, items, headers = load_inquiry_data(args.input, log)

    fill_inquiry_rates(
        client=client,
        wb_inq=wb,
        items_to_fill=items,
        pricelist_descs=price_descs,
        pricelist_rates=price_rates,
        header_rows=headers,
        model=EMBEDDING_MODEL,
        logger_fn=log,
    )

    wb.save(args.output)
    wb.close()
    print(f"Saved output to {args.output}")


if __name__ == "__main__":
    main()
