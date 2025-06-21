import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
import os
import sys
import subprocess
import threading
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('price_matcher_gui.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

class EnhancedPricelistMatcherApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Enhanced Pricelist Matching Application (Cohere Embed v4.0)")
        self.root.geometry("800x650")
        self.root.resizable(True, True)

        # Variables
        self.inquiry_path = tk.StringVar()
        self.pricelist_path = tk.StringVar()
        self.api_key_var = tk.StringVar(value=os.getenv('COHERE_API_KEY', ''))
        self.output_folder = tk.StringVar()
        self.similarity_threshold = tk.DoubleVar(value=0.3)

        self.build_enhanced_widgets()

    def build_enhanced_widgets(self):
        # Main container
        main_frame = tk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Configuration section
        config_frame = tk.LabelFrame(main_frame, text="Configuration", padx=10, pady=10)
        config_frame.pack(fill=tk.X, pady=(0, 10))

        # Inquiry file selection
        tk.Label(config_frame, text="Inquiry Excel File:").grid(row=0, column=0, sticky="w", pady=2)
        inquiry_frame = tk.Frame(config_frame)
        inquiry_frame.grid(row=0, column=1, columnspan=2, sticky="ew", padx=(10, 0))
        tk.Entry(inquiry_frame, textvariable=self.inquiry_path, width=60).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(inquiry_frame, text="Browse...", 
                 command=self.browse_inquiry_file).pack(side=tk.RIGHT, padx=(5, 0))

        # Pricelist file selection
        tk.Label(config_frame, text="Pricelist Excel File:").grid(row=1, column=0, sticky="w", pady=2)
        pricelist_frame = tk.Frame(config_frame)
        pricelist_frame.grid(row=1, column=1, columnspan=2, sticky="ew", padx=(10, 0))
        tk.Entry(pricelist_frame, textvariable=self.pricelist_path, width=60).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(pricelist_frame, text="Browse...", 
                 command=self.browse_pricelist_file).pack(side=tk.RIGHT, padx=(5, 0))

        # API key entry
        tk.Label(config_frame, text="Cohere API Key:").grid(row=2, column=0, sticky="w", pady=2)
        tk.Entry(config_frame, textvariable=self.api_key_var, show="*", width=60).grid(
            row=2, column=1, columnspan=2, sticky="ew", padx=(10, 0), pady=2)

        # Output folder selection
        tk.Label(config_frame, text="Output Folder:").grid(row=3, column=0, sticky="w", pady=2)
        output_frame = tk.Frame(config_frame)
        output_frame.grid(row=3, column=1, columnspan=2, sticky="ew", padx=(10, 0))
        tk.Entry(output_frame, textvariable=self.output_folder, width=60).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(output_frame, text="Select...", 
                 command=self.browse_output_folder).pack(side=tk.RIGHT, padx=(5, 0))

        # Advanced settings
        advanced_frame = tk.LabelFrame(config_frame, text="Advanced Settings")
        advanced_frame.grid(row=4, column=0, columnspan=3, sticky="ew", pady=(10, 0))
        
        tk.Label(advanced_frame, text="Similarity Threshold:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        threshold_scale = tk.Scale(advanced_frame, from_=0.1, to=1.0, resolution=0.1, 
                                  orient=tk.HORIZONTAL, variable=self.similarity_threshold, length=200)
        threshold_scale.grid(row=0, column=1, sticky="w", padx=5)
        tk.Label(advanced_frame, text="(Lower = more matches, Higher = stricter matches)").grid(
            row=0, column=2, sticky="w", padx=5)

        # Configure grid weights
        config_frame.columnconfigure(1, weight=1)
        inquiry_frame.columnconfigure(0, weight=1)
        pricelist_frame.columnconfigure(0, weight=1)
        output_frame.columnconfigure(0, weight=1)

        # Progress section
        progress_frame = tk.LabelFrame(main_frame, text="Progress & Results", padx=10, pady=10)
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(progress_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.pack(fill=tk.X, pady=(0, 10))

        # Log display
        log_frame = tk.Frame(progress_frame)
        log_frame.pack(fill=tk.BOTH, expand=True)
        
        self.log_box = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, height=15)
        self.log_box.pack(fill=tk.BOTH, expand=True)

        # Control buttons
        button_frame = tk.Frame(main_frame)
        button_frame.pack(fill=tk.X)

        self.process_btn = tk.Button(
            button_frame, text="Start Processing", command=self.on_process_thread,
            bg="#4CAF50", fg="white", font=("Arial", 10, "bold"), height=2
        )
        self.process_btn.pack(side=tk.LEFT, padx=(0, 10))

        self.clear_log_btn = tk.Button(
            button_frame, text="Clear Log", command=self.clear_log,
            bg="#2196F3", fg="white"
        )
        self.clear_log_btn.pack(side=tk.LEFT, padx=(0, 10))

        self.export_log_btn = tk.Button(
            button_frame, text="Export Log", command=self.export_log,
            bg="#FF9800", fg="white"
        )
        self.export_log_btn.pack(side=tk.LEFT)

    def browse_inquiry_file(self):
        filename = filedialog.askopenfilename(
            title="Select Inquiry Excel File",
            filetypes=[("Excel files", "*.xlsx *.xls"), ("All files", "*.*")]
        )
        if filename:
            self.inquiry_path.set(filename)

    def browse_pricelist_file(self):
        filename = filedialog.askopenfilename(
            title="Select Pricelist Excel File",
            filetypes=[("Excel files", "*.xlsx *.xls"), ("All files", "*.*")]
        )
        if filename:
            self.pricelist_path.set(filename)

    def browse_output_folder(self):
        folder = filedialog.askdirectory(title="Select Output Folder")
        if folder:
            self.output_folder.set(folder)
    def log(self, msg):
        """Enhanced logging with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted_msg = f"[{timestamp}] {msg}"
        
        self.log_box.config(state="normal")
        self.log_box.insert(tk.END, formatted_msg + "\n")
        self.log_box.see(tk.END)
        self.log_box.config(state="disabled")
        
        # Update progress bar if message contains progress info
        if "Progress:" in msg and "%" in msg:
            try:
                percentage = float(msg.split("%")[0].split(":")[-1].strip())
                self.progress_var.set(percentage)
            except:
                pass
        
        self.root.update_idletasks()

    def clear_log(self):
        self.log_box.config(state="normal")
        self.log_box.delete(1.0, tk.END)
        self.log_box.config(state="disabled")
        self.progress_var.set(0)

    def export_log(self):
        if not self.log_box.get(1.0, tk.END).strip():
            messagebox.showwarning("Warning", "No log content to export.")
            return
        
        filename = filedialog.asksaveasfilename(
            title="Export Log",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(self.log_box.get(1.0, tk.END))
                messagebox.showinfo("Success", f"Log exported to {filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export log: {str(e)}")

    def get_auto_output_path(self):
        folder = self.output_folder.get()
        if not folder:
            raise RuntimeError("Please specify an output folder.")
        now = datetime.now()
        filename = now.strftime("Enhanced_Output_%Y%m%d_%H%M%S.xlsx")
        return os.path.join(folder, filename)

    def validate_inputs(self):
        """Enhanced input validation"""
        errors = []
        
        if not self.inquiry_path.get():
            errors.append("Please select an inquiry Excel file.")
        elif not os.path.exists(self.inquiry_path.get()):
            errors.append("Selected inquiry file does not exist.")
        
        if not self.pricelist_path.get():
            errors.append("Please select a pricelist Excel file.")
        elif not os.path.exists(self.pricelist_path.get()):
            errors.append("Selected pricelist file does not exist.")
        
        if not self.api_key_var.get().strip():
            errors.append("Please enter your Cohere API key.")
        
        if not self.output_folder.get():
            errors.append("Please specify an output folder.")
        elif not os.path.exists(self.output_folder.get()):
            errors.append("Selected output folder does not exist.")
        
        if errors:
            raise RuntimeError("\n".join(errors))

    def on_process_thread(self):
        """Start processing in a separate thread"""
        t = threading.Thread(target=self.on_process)
        t.daemon = True
        t.start()

    def on_process(self):
        """Enhanced main processing function using command-line script"""
        self.process_btn.config(state=tk.DISABLED)
        self.progress_var.set(0)
        
        try:
            # Validate inputs
            self.validate_inputs()
            
            self.log("=== Enhanced Price Matching Started ===")
            self.log(f"Inquiry file: {self.inquiry_path.get()}")
            self.log(f"Pricelist file: {self.pricelist_path.get()}")
            self.log(f"Similarity threshold: {self.similarity_threshold.get()}")
            
            # Determine output path
            output_path = self.get_auto_output_path()
            if os.path.exists(output_path):
                if not messagebox.askyesno("Overwrite?", 
                                         f"Output file already exists:\n{output_path}\n\nOverwrite?"):
                    self.log("❌ Process cancelled by user.")
                    return

            # Use the enhanced command-line script
            script_path = os.path.join(os.path.dirname(__file__), "cohereexcelparsing.py")
            
            cmd = [
                "python", script_path,
                "--inquiry", self.inquiry_path.get(),
                "--pricelist", self.pricelist_path.get(),
                "--output", output_path,
                "--api-key", self.api_key_var.get().strip(),
                "--similarity-threshold", str(self.similarity_threshold.get()),
                "--verbose"
            ]
            
            self.log("🚀 Starting enhanced price matching process...")
            
            # Run the command-line script
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Monitor progress
            while True:
                if process.stdout is None:
                    break
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    if line.startswith("PROGRESS:"):
                        try:
                            percentage = float(line.split(":")[1].strip().replace("%", ""))
                            self.progress_var.set(percentage)
                        except:
                            pass
                    else:
                        self.log(line)
            
            # Get any remaining output
            stdout, stderr = process.communicate()
            
            if stdout:
                for line in stdout.strip().split('\n'):
                    if line.strip():
                        self.log(line.strip())
            
            if process.returncode == 0:
                self.log("✅ Processing completed successfully!")
                self.log(f"📁 Output saved to: {output_path}")
                messagebox.showinfo("Success", f"Processing completed!\nOutput saved to:\n{output_path}")
            else:
                error_msg = stderr if stderr else "Unknown error occurred"
                self.log(f"❌ Error: {error_msg}")
                messagebox.showerror("Error", f"Processing failed:\n{error_msg}")

        except Exception as e:
            error_msg = f"❌ Error: {str(e)}"
            self.log(error_msg)
            messagebox.showerror("Error", str(e))
            logger.error(f"Processing failed: {str(e)}")
        finally:
            self.process_btn.config(state=tk.NORMAL)
            self.progress_var.set(100)

# Command-line interface support
def run_command_line():
    """Enhanced command-line interface using the cohereexcelparsing.py script"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Enhanced Cohere Price Matching Tool")
    parser.add_argument('--inquiry', required=True, help='Path to inquiry Excel file')
    parser.add_argument('--pricelist', required=True, help='Path to pricelist Excel file')
    parser.add_argument('--output', required=True, help='Path for output Excel file')
    parser.add_argument('--api-key', required=True, help='Cohere API key')
    parser.add_argument('--similarity-threshold', type=float, default=0.3,
                       help='Minimum similarity threshold for matches')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        print("=== Enhanced Cohere Price Matching (CLI Mode) ===")
        print(f"Inquiry file: {args.inquiry}")
        print(f"Pricelist file: {args.pricelist}")
        print(f"Output file: {args.output}")
        print(f"Similarity threshold: {args.similarity_threshold}")
        
        # Use the command-line script
        script_path = os.path.join(os.path.dirname(__file__), "cohereexcelparsing.py")
        
        cmd = [
            "python", script_path,
            "--inquiry", args.inquiry,
            "--pricelist", args.pricelist,
            "--output", args.output,
            "--api-key", args.api_key,
            "--similarity-threshold", str(args.similarity_threshold)
        ]
        
        if args.verbose:
            cmd.append("--verbose")
        
        # Run the command-line script
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Processing completed successfully!")
            print(result.stdout)
        else:
            print(f"❌ Error: {result.stderr}")
            sys.exit(1)
        
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        logger.error(f"CLI processing failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Check if running in CLI mode
    if len(sys.argv) > 1:
        run_command_line()
    else:
        # Run GUI mode
        root = tk.Tk()
        app = EnhancedPricelistMatcherApp(root)
        root.mainloop()